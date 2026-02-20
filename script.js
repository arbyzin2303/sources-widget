define(['jquery'], function($) {
	'use strict';

	return function() {
		var self = this;

		this.code = 'leads_sources_diagram';
		this.widget_class = 'leads-sources-diagram';

		this.callbacks = {
			render: function() {
				return true;
			},

			init: function() {
				var area = self.system().area;

				if (area === 'everywhere' || area === 'dashboard' ||
					window.location.pathname === '/' ||
					window.location.pathname.match(/^\/dashboard/)) {
					self.callbacks.startDashboardSync();
				}

				return true;
			},

			bind_actions: function() {
				return true;
			},

			// ---- State ----

			_syncInterval: null,
			_lastSentHash: '',
			_sourceNameMap: {},

			// ---- Dashboard data pipeline ----

			startDashboardSync: function() {
				self.callbacks.buildSourceMap(function() {
					self.callbacks.syncOnce();
				});

				if (self.callbacks._syncInterval) {
					clearInterval(self.callbacks._syncInterval);
				}
				self.callbacks._syncInterval = setInterval(function() {
					self.callbacks.syncOnce();
				}, 60000);
			},

			syncOnce: function() {
				self.callbacks.fetchLeads(function(sourceData) {
					if (!sourceData || sourceData.length === 0) return;

					var hash = JSON.stringify(sourceData);
					if (hash === self.callbacks._lastSentHash) return;
					self.callbacks._lastSentHash = hash;

					self.callbacks.postToIframes(sourceData);
				});
			},

			/**
			 * Загружает маппинг source_id -> название источника
			 * из воронок (pipelines) и их источников.
			 */
			buildSourceMap: function(callback) {
				$.ajax({
					url: '/api/v4/leads/pipelines',
					method: 'GET',
					dataType: 'json',
					success: function(response) {
						if (response && response._embedded && response._embedded.pipelines) {
							var pipelines = response._embedded.pipelines;
							for (var i = 0; i < pipelines.length; i++) {
								var p = pipelines[i];
								if (p._embedded && p._embedded.sources) {
									var sources = p._embedded.sources;
									for (var j = 0; j < sources.length; j++) {
										if (sources[j].id && sources[j].name) {
											self.callbacks._sourceNameMap[sources[j].id] = sources[j].name;
										}
										if (sources[j].external_id && sources[j].name) {
											self.callbacks._sourceNameMap['ext_' + sources[j].external_id] = sources[j].name;
										}
									}
								}
							}
						}
						if (callback) callback();
					},
					error: function() {
						if (callback) callback();
					}
				});
			},

			// ---- Fetching leads ----

			fetchLeads: function(callback) {
				var settings = self.get_settings();
				var period = self.callbacks.detectPeriod();
				var range = self.callbacks.periodToRange(period);

				var params = {
					limit: 250,
					with: 'source_id'
				};
				if (range.from) {
					params['filter[created_at][from]'] = range.from;
				}
				if (range.to) {
					params['filter[created_at][to]'] = range.to;
				}

				var allLeads = [];

				var fetchPage = function(page) {
					params.page = page;

					$.ajax({
						url: '/api/v4/leads',
						method: 'GET',
						data: params,
						dataType: 'json',
						success: function(response) {
							if (response && response._embedded && response._embedded.leads) {
								allLeads = allLeads.concat(response._embedded.leads);

								if (response._links && response._links.next && allLeads.length < 2000) {
									fetchPage(page + 1);
									return;
								}
							}
							callback(self.callbacks.aggregateSources(allLeads, settings));
						},
						error: function() {
							callback(self.callbacks.aggregateSources(allLeads, settings));
						}
					});
				};

				fetchPage(1);
			},

			detectPeriod: function() {
				var urlParams = new URLSearchParams(window.location.search);
				return urlParams.get('amocrm_period') || 'month';
			},

			periodToRange: function(period) {
				var now = Math.floor(Date.now() / 1000);
				var day = 86400;
				var from;

				switch (period) {
					case 'day':
						var d = new Date();
						d.setHours(0, 0, 0, 0);
						from = Math.floor(d.getTime() / 1000);
						break;
					case 'week':
						from = now - 7 * day;
						break;
					case 'month':
					default:
						from = now - 30 * day;
						break;
				}

				return { from: from, to: now };
			},

			// ---- Source detection ----

			/**
			 * Определяет название источника сделки.
			 * Порядок приоритета:
			 *   1. _embedded.source (системный источник из API с with=source_id)
			 *   2. source_id → маппинг из воронок
			 *   3. Кастомные поля (Источник, utm_source, и т.д.)
			 *   4. Теги
			 *   5. «Интерфейс» (создана вручную)
			 */
			detectSource: function(lead, settings) {
				var name;

				// 1. Системный источник из _embedded.source
				if (lead._embedded && lead._embedded.source) {
					var src = lead._embedded.source;
					name = src.name || src.service || src.type;
					if (name) return self.callbacks.normalizeSourceName(name);
				}

				// 2. source_id → маппинг из воронок
				if (lead.source_id) {
					var mapped = self.callbacks._sourceNameMap[lead.source_id];
					if (mapped) return self.callbacks.normalizeSourceName(mapped);
				}
				if (lead.source_external_id) {
					var mappedExt = self.callbacks._sourceNameMap['ext_' + lead.source_external_id];
					if (mappedExt) return self.callbacks.normalizeSourceName(mappedExt);
				}

				// 3. Кастомные поля
				if (lead.custom_fields_values) {
					var sourceFieldNames = [
						'источник', 'source', 'utm_source',
						'рекламный канал', 'канал', 'channel'
					];
					var customSourceField = null;
					if (settings && settings.source_field_name) {
						customSourceField = settings.source_field_name.toLowerCase().trim();
					}

					for (var i = 0; i < lead.custom_fields_values.length; i++) {
						var field = lead.custom_fields_values[i];
						var fname = (field.field_name || '').toLowerCase().trim();

						var match = false;
						if (customSourceField && fname === customSourceField) {
							match = true;
						}
						if (!match) {
							for (var j = 0; j < sourceFieldNames.length; j++) {
								if (fname === sourceFieldNames[j] || fname.indexOf(sourceFieldNames[j]) !== -1) {
									match = true;
									break;
								}
							}
						}
						if (match && field.values && field.values[0] && field.values[0].value) {
							return self.callbacks.normalizeSourceName(field.values[0].value);
						}
					}
				}

				// 4. Теги
				if (lead._embedded && lead._embedded.tags && lead._embedded.tags.length > 0) {
					var tagMap = {
						'директ': 'Я Директ', 'yandex direct': 'Я Директ', 'я директ': 'Я Директ',
						'сайт': 'Сайт', 'website': 'Сайт', 'site': 'Сайт',
						'агрегатор': 'Агрегаторы', 'aggregator': 'Агрегаторы',
						'яндекс карт': 'Яндекс карты', 'yandex maps': 'Яндекс карты',
						'гугл карт': 'Гугл карты', 'google maps': 'Гугл карты',
						'2гис': '2 ГИС', '2 гис': '2 ГИС', '2gis': '2 ГИС'
					};
					for (var t = 0; t < lead._embedded.tags.length; t++) {
						var tagName = (lead._embedded.tags[t].name || '').toLowerCase();
						for (var key in tagMap) {
							if (tagMap.hasOwnProperty(key) && tagName.indexOf(key) !== -1) {
								return tagMap[key];
							}
						}
					}
				}

				// 5. Если ничего не нашли — создано вручную
				return 'Интерфейс';
			},

			/**
			 * Нормализует название источника для единообразия в диаграмме.
			 * Например: "яндекс директ" → "Я Директ", "2gis" → "2 ГИС".
			 */
			normalizeSourceName: function(raw) {
				if (!raw) return 'Другое';
				var lower = raw.toLowerCase().trim();

				var aliases = {
					'я директ':       'Я Директ',
					'яндекс директ':  'Я Директ',
					'yandex direct':  'Я Директ',
					'яндекс.директ':  'Я Директ',
					'yandex.direct':  'Я Директ',
					'директ':         'Я Директ',

					'сайт':    'Сайт',
					'website': 'Сайт',
					'site':    'Сайт',
					'web':     'Сайт',

					'агрегатор':   'Агрегаторы',
					'агрегаторы':  'Агрегаторы',
					'aggregator':  'Агрегаторы',
					'aggregators': 'Агрегаторы',

					'яндекс карты':   'Яндекс карты',
					'яндекс.карты':   'Яндекс карты',
					'yandex maps':    'Яндекс карты',
					'yandex.maps':    'Яндекс карты',
					'я.карты':        'Яндекс карты',

					'гугл карты':   'Гугл карты',
					'google maps':  'Гугл карты',
					'google карты': 'Гугл карты',

					'2 гис':  '2 ГИС',
					'2гис':   '2 ГИС',
					'2gis':   '2 ГИС',
					'двагис': '2 ГИС',

					'интерфейс': 'Интерфейс',
					'interface': 'Интерфейс'
				};

				for (var alias in aliases) {
					if (aliases.hasOwnProperty(alias) && lower === alias) {
						return aliases[alias];
					}
				}

				// Частичное совпадение
				for (var partial in aliases) {
					if (aliases.hasOwnProperty(partial) && lower.indexOf(partial) !== -1) {
						return aliases[partial];
					}
				}

				// Если не нашли алиас — возвращаем оригинал с заглавной буквы
				return raw.charAt(0).toUpperCase() + raw.slice(1);
			},

			// ---- Aggregation ----

			aggregateSources: function(leads, settings) {
				var counts = {};
				for (var i = 0; i < leads.length; i++) {
					var src = self.callbacks.detectSource(leads[i], settings);
					counts[src] = (counts[src] || 0) + 1;
				}

				var result = [];
				for (var name in counts) {
					if (counts.hasOwnProperty(name)) {
						result.push({ name: name, count: counts[name] });
					}
				}

				result.sort(function(a, b) { return b.count - a.count; });
				return result;
			},

			// ---- Communication with iframe ----

			postToIframes: function(sourceData) {
				var iframes = document.querySelectorAll('iframe');
				var period = self.callbacks.detectPeriod();
				var message = {
					type: 'sources_data',
					data: sourceData
				};
				var periodMsg = {
					type: 'sources_period',
					period: period
				};

				for (var i = 0; i < iframes.length; i++) {
					try {
						iframes[i].contentWindow.postMessage(message, '*');
						iframes[i].contentWindow.postMessage(periodMsg, '*');
					} catch(e) {}
				}
			},

			// ---- Settings / Lifecycle ----

			settings: function($modal_body) {
				return true;
			},

			onSave: function(params) {
				return true;
			},

			destroy: function() {
				if (self.callbacks._syncInterval) {
					clearInterval(self.callbacks._syncInterval);
					self.callbacks._syncInterval = null;
				}
			}
		};

		return this;
	};
});
