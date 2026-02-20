# Документация: Создание виджетов для amoCRM

## Оглавление
1. [Введение](#введение)
2. [Структура файлов виджета](#структура-файлов-виджета)
3. [Обязательные файлы](#обязательные-файлы)
4. [Конфигурационные файлы](#конфигурационные-файлы)
5. [Основной JavaScript файл](#основной-javascript-файл)
6. [Локализация](#локализация)
7. [Дополнительные ресурсы](#дополнительные-ресурсы)
8. [Процесс разработки](#процесс-разработки)
9. [Типовые ошибки и их решение](#типовые-ошибки-и-их-решение)
10. [Важные замечания](#важные-замечания)
11. [Примеры использования](#примеры-использования)

---

## Введение

Виджеты для amoCRM позволяют расширять функциональность системы, добавляя пользовательские интерфейсы и логику. Виджет представляет собой набор файлов, которые загружаются и выполняются в контексте amoCRM.

### Основные требования
- Виджет должен быть совместим с API amoCRM
- Использовать AMD (Asynchronous Module Definition) для загрузки модулей
- Поддерживать локализацию для разных языков
- Следовать структуре файлов, требуемой amoCRM

### Критические требования к файлам
- **Кодировка:** Все текстовые файлы (JSON, JavaScript) должны быть в кодировке **UTF-8 без BOM**
- **Синтаксис JSON:** Все JSON файлы должны иметь корректный синтаксис
- **Уникальность:** Коды и ключи в `manifest.json` должны быть уникальными (не из примеров)

---

## Структура файлов виджета

### Структура директории

Базовая структура директории виджета должна выглядеть следующим образом:

```
widget-name/
├── manifest.json          # Обязательный: основная конфигурация виджета
├── config.json            # Опциональный: дополнительные настройки
├── script.js              # Обязательный: основной JavaScript код виджета
├── i18n/                  # Обязательный: файлы локализации
│   ├── ru.json           # Русская локализация
│   └── en.json           # Английская локализация
└── images/                # Опциональный: изображения виджета
    ├── logo.png
    └── logo_small.png
```

### Структура архива

**ВАЖНО:** При упаковке виджета в ZIP архив, файлы должны находиться **непосредственно в корне архива**, без дополнительной папки `widget`.

**Правильная структура:**
```
widget-archive.zip
├── manifest.json
├── script.js
├── config.json
├── i18n/
│   ├── ru.json
│   └── en.json
└── images/
    └── logo.png
```

**Неправильная структура** (приведет к ошибке):
```
widget-archive.zip
└── widget/              ← НЕПРАВИЛЬНО! Папка widget не нужна
    ├── manifest.json
    └── ...
```

---

## Обязательные файлы

### 1. manifest.json

Это основной конфигурационный файл виджета. Он содержит метаданные, настройки и описание виджета.

#### Структура manifest.json:

```json
{
    "widget": {
        "name": "widget.name",
        "description": "widget.description",
        "short_description": "widget.short_description",
        "interface_version": 2,
        "init_once": true,
        "locale": ["ru", "en"],
        "installation": true,
        "version": "1.0.0"
    },
    "locations": [
        "settings",
        "advanced_settings",
        "everywhere"
    ],
    "advanced": {
        "title": "advanced.title"
    },
    "settings": {
        "setting_key": {
            "name": "settings.setting_key",
            "type": "text",
            "required": false
        }
    }
}
```

#### Обязательные поля в секции `widget`:
- `name` - название виджета (ключ локализации)
- `description` - описание виджета (ключ локализации)
- `short_description` - краткое описание (ключ локализации)
- `interface_version` - версия интерфейса (обычно 2)
- `locale` - массив поддерживаемых языков
- `version` - версия виджета

#### Типы полей настроек (`settings`)

В разделе `settings` файла `manifest.json` можно использовать следующие типы полей:

- **`text`** - текстовое поле для ввода произвольного текста
- **`pass`** - поле для ввода пароля (текст скрыт при вводе)
- **`users`** - список пользователей системы с одним текстовым полем на каждого пользователя. Используется, когда нужно ввести информацию по каждому сотруднику (например, внутренний телефонный номер для IP-телефонии)
- **`users_lp`** - список пользователей системы с двумя полями (login, password) на каждого. Используется, когда по каждому сотруднику необходимо предоставить пары значений, например login-password
- **`custom`** - поле произвольной структуры для добавления собственной программной логики на страницу настроек виджета. Позволяет создавать поля с произвольной структурой и внешним видом. **Важно:** в виджете может быть не более одного поля типа `custom`. Поле может содержать только JSON-строку либо число (строчный тип данных на сервере сохраняться не будет). Для использования необходимо добавить `"settings"` в массив `locations` в `manifest.json`.

#### Примеры использования типов полей

**Пример 1: Текстовое поле и поле пароля**

```json
{
    "settings": {
        "login": {
            "name": "settings.login",
            "type": "text",
            "required": false
        },
        "password": {
            "name": "settings.password",
            "type": "pass",
            "required": false
        }
    }
}
```

**Соответствующий файл локализации (i18n/en.json):**
```json
{
    "settings": {
        "login": "User login",
        "password": "User password"
    }
}
```

**Пример 2: Поле типа users**

Используется для ввода информации по каждому сотруднику (например, внутренний телефон):

```json
{
    "settings": {
        "phones": {
            "name": "settings.user_phones",
            "type": "users",
            "required": true
        }
    }
}
```

**Соответствующий файл локализации (i18n/en.json):**
```json
{
    "settings": {
        "user_phones": "Phones list"
    }
}
```

**Пример 3: Поле типа users_lp**

Используется для ввода пар логин-пароль по каждому сотруднику:

```json
{
    "settings": {
        "auth_data": {
            "name": "settings.auth_data",
            "type": "users_lp",
            "required": false
        }
    }
}
```

**Соответствующий файл локализации (i18n/en.json):**
```json
{
    "settings": {
        "auth_data": "Authentication data"
    }
}
```

**Пример 4: Поле типа custom**

Поле `custom` используется для создания полей с произвольной структурой и внешним видом на странице настроек виджета.

```json
{
    "widget": {
        "code": "my_widget"
    },
    "locations": ["settings", "everywhere"],
    "settings": {
        "myfield": {
            "name": "settings.myfield",
            "type": "custom",
            "required": false
        }
    }
}
```

**Работа с полем custom в script.js:**

После загрузки виджета в аккаунт становятся доступны:
- `div` с ID `<код виджета>_custom_content` - контейнер для DOM-элементов
- `hidden input` с ID `<код виджета>_custom` - поле для чтения и сохранения данных

**Важно:** Поле может содержать только JSON-строку либо число. Строчный тип данных на сервере сохраняться не будет.

```javascript
settings: function($modal_body) {
    var widgetCode = self.get_settings().widget_code; // или this.code
    
    // Получаем контейнер для кастомного контента
    var $customContent = $('#' + widgetCode + '_custom_content');
    var $customInput = $('#' + widgetCode + '_custom');
    
    // Добавляем свой контент в контейнер
    $customContent.html('<div class="my-custom-field">' +
        '<input type="checkbox" id="my-checkbox" />' +
        '<label for="my-checkbox">Согласие на обработку данных</label>' +
        '</div>');
    
    // Обработчик изменения
    $customContent.find('#my-checkbox').on('change', function() {
        var value = $(this).prop('checked') ? 1 : 0;
        
        // Сохраняем значение в hidden input
        $customInput.val(value);
        
        // Важно: создаем событие change на системном инпуте,
        // чтобы изменения отражались в форме и ее кнопках
        $('input[name="myfield"]').trigger('change');
    });
    
    // Загружаем сохраненное значение
    var savedValue = $customInput.val();
    if (savedValue) {
        $customContent.find('#my-checkbox').prop('checked', savedValue == 1);
    }
    
    return true;
}
```

#### Дополнительные возможности manifest.json

**Тур виджета (опционально)**

Для добавления тура в модальное окно виджета необходимо добавить свойство `tour` в `manifest.json`:

```json
{
    "widget": { ... },
    "tour": {
        "is_tour": true,
        "tour_images": {
            "ru": [
                "/images/tour_1_ru.png",
                "/images/tour_2_ru.png",
                "/images/tour_3_ru.png"
            ],
            "en": [
                "/images/tour_1_en.png",
                "/images/tour_2_en.png",
                "/images/tour_3_en.png"
            ]
        },
        "tour_description": "widget.tour_description"
    }
}
```

**Расширенные настройки виджета**

Виджеты amoCRM могут создавать свою собственную страницу в разделе "Настройки". Для этого необходимо:

1. Указать область `"advanced_settings"` в массиве `locations` в `manifest.json`
2. Добавить блок `advanced` в `manifest.json` с ключом `title` (ключ локализации)

```json
{
    "widget": {
        "name": "widget.name",
        "code": "example_widget",
        "version": "1.9",
        "interface_version": 2,
        "locale": ["ru"],
        "installation": true
    },
    "locations": [
        "everywhere",
        "settings",
        "advanced_settings"
    ],
    "settings": {
        "login": {
            "name": "settings.login",
            "type": "text",
            "required": false
        }
    },
    "advanced": {
        "title": "advanced.title"
    }
}
```

**ВАЖНО:** Перед первой загрузкой виджета необходимо заменить все примеры кодов и ключей на сгенерированные вами уникальные значения. Если виджет был загружен с неверным manifest, предыдущий код и ключ будут дескредитированы — необходимо сгенерировать новые.

---

### 2. script.js

Основной JavaScript файл виджета. Должен использовать AMD формат и возвращать функцию-конструктор виджета.

**Важно:** Весь виджет представляется в виде объекта. Когда система загружает виджеты, она расширяет существующий системный объект `Widget` функционалом, описанным в `script.js`. Таким образом, объект виджета наследует свойства и методы системного объекта `Widget`, которые полезны для работы.

#### Базовая структура script.js:

```javascript
define(['jquery'], function($) {
    'use strict';
    
    return function() {
        var self = this;
        
        // Получение системных данных и локализации
        var system = self.system();  // Объект с переменными системы
        var langs = self.langs;      // Объект локализации из файлов i18n
        
        // Конфигурация виджета
        this.code = 'widget_code';
        this.widget_class = 'widget-class';
        
        // Callbacks - методы обратного вызова виджета
        this.callbacks = {
            render: function() {
                return true;
            },
            init: function() {
                return true;
            },
            bind_actions: function() {
                return true;
            },
            settings: function($modal_body) {
                return true;
            },
            dpSettings: function() {
                return true;
            },
            advancedSettings: function() {
                return true;
            },
            onSave: function(params) {
                return true;
            },
            destroy: function() {
                // Очистка ресурсов
            },
            contacts: {
                selected: function() {
                    // Обработка выбранных контактов
                }
            },
            leads: {
                selected: function() {
                    // Обработка выбранных сделок
                }
            },
            todo: {
                selected: function() {
                    // Обработка выбранных задач
                }
            },
            onSource: function() {
                // Логика работы источника
            },
            onSalesbotDesignerSave: function(handler_code, params) {
                // Работа в Salesbot
            },
            onAddAsSource: function(pipeline_id) {
                // Добавление как источника
            }
        };
        
        return this;
    };
});
```

#### Порядок вызова методов и обязательные методы

**Важно:** Методы вызываются в определенном порядке, и некоторые из них критически важны для работы виджета.

1. **`render()`** - рендеринг виджета (вызывается первым)
   - При сборке виджета первым вызывается `callbacks.render`
   - Виджет отображается самостоятельно только в меню настроек (settings)
   - Для отображения в других областях используйте `render_template()`
   - **КРИТИЧЕСКИ ВАЖНО:** Должен возвращать `true`, иначе не запустятся `init()` и `bind_actions()`

2. **`init()`** - инициализация виджета
   - Запускается сразу после `render()` одновременно с `bind_actions()`
   - Используется для сбора информации, связи со сторонним сервером, авторизации по API
   - Может определять текущую локацию (`self.system().area`)
   - Должен возвращать `true` для дальнейшей работы

3. **`bind_actions()`** - привязка обработчиков событий
   - Запускается одновременно с `init()` после `render()`
   - Используется для навешивания событий на действия пользователя
   - Должен возвращать `true`

4. **`settings($modal_body)`** - отображение страницы настроек
   - Вызывается при щелчке на иконку виджета в области настроек
   - `$modal_body` - jQuery объект блока правой части модального окна
   - Может использоваться для добавления модального окна, кастомных элементов
   - Должен возвращать `true`

5. **`onSave(params)`** - обработка сохранения настроек
   - Вызывается при щелчке на кнопке "Установить/Сохранить" в настройках виджета
   - Также срабатывает при отключении виджета (сначала `onSave`, затем `destroy`)
   - `params` - объект с сохраненными настройками
   - Должен возвращать `true`

6. **`destroy()`** - очистка ресурсов
   - Вызывается при отключении виджета через меню настроек
   - Также срабатывает при переходе между областями отображения виджета
   - Используется для удаления элементов из DOM, очистки обработчиков событий
   - Не требует возврата значения

#### Дополнительные методы (опциональные)

- **`dpSettings()`** - настройки для digital pipeline
- **`advancedSettings()`** - расширенные настройки (требует `"advanced_settings"` в `locations`). Данная страница полностью контролируется виджетом - DOM-страницы и её структуру виджеты должны формировать сами
- **`contacts.selected()`** - обработка выбранных контактов
- **`leads.selected()`** - обработка выбранных сделок
- **`todo.selected()`** - обработка выбранных задач
- **`onSource()`** - логика работы источника
- **`onSalesbotDesignerSave(handler_code, params)`** - работа в Salesbot
- **`onAddAsSource(pipeline_id)`** - добавление как источника в воронке

#### Работа с DOM и API amoCRM

**Работа с DOM:**

```javascript
// Получение рабочей области
var $workArea = $('#work-area-' + this.code);
if ($workArea.length === 0) {
    $workArea = $('<div id="work-area-' + this.code + '"></div>');
    // Добавление в нужное место
}
```

**Работа с API amoCRM:**

```javascript
// Доступ к константам
if (typeof APP !== 'undefined' && APP.constant) {
    var data = APP.constant('constant_name');
}

// AJAX запросы через jQuery
$.ajax({
    url: '/ajax/endpoint',
    method: 'POST',
    data: { /* данные */ },
    success: function(response) {
        // Обработка ответа
    }
});
```

#### Методы объекта widget

Виджет наследует от системного объекта `Widget` множество полезных методов.

##### Получение системных данных

**`self.system()`** - возвращает объект с системными данными:
```javascript
var system = self.system();
// {
//     area: "ccard",           // Область, где воспроизводится виджет
//     amouser_id: "103586",    // ID пользователя
//     amouser: "user@amocrm.ru", // Почта пользователя
//     amohash: "d053abd660..."   // Ключ для авторизации API
// }
```

**`self.get_settings()`** - получение настроек виджета:
```javascript
var settings = self.get_settings();
// Возвращает объект с данными, введенными пользователем при подключении виджета
```

**`self.get_version()`** - получение версии виджета:
```javascript
var version = self.get_version();
// Возвращает строку, например: "1.0.0"
// Полезно для сброса кэша статики после обновления
```

**`self.get_install_status()`** - получение статуса установки:
```javascript
var status = self.get_install_status();
// "installed" - виджет установлен
// "install" - виджет не установлен
// "not_configured" - тур пройден, но настройки не заполнены
```

##### Работа с локализацией

**`self.i18n(objname)`** - получение объекта локализации:
```javascript
var langData = self.i18n('settings');
// Возвращает объект с сообщениями на текущем языке пользователя
```

**`self.set_lang(langs)`** - изменение параметров локализации:
```javascript
var langs = self.langs;
langs.settings.apiurl = 'apiurl_new';
self.set_lang(langs);
```

##### Работа с настройками

**`self.set_settings(settings)`** - добавление свойств виджета:
```javascript
self.set_settings({par1: "text", par2: "value"});
```

##### Работа с выбранными элементами

**`self.list_selected()`** - получение выбранных элементов:
```javascript
var selected = self.list_selected();
// {
//     count_selected: 2,
//     selected: [
//         {
//             id: 12345,
//             emails: ["email@example.com"],
//             phones: ["+79991234567"],
//             type: "contact"
//         }
//     ]
// }
```

##### Работа с шаблонами

**`self.render(data, params)`** - рендеринг шаблонов twig.js:
```javascript
// Простой пример с шаблоном
var template = '<div>{% for item in items %}<p>{{ item.name }}</p>{% endfor %}</div>';
var html = self.render(
    {data: template},
    {items: [{name: 'Item 1'}, {name: 'Item 2'}]}
);

// Использование системного шаблона
var selectHtml = self.render(
    {ref: '/tmpl/controls/select.twig'},
    {
        items: [{option: 'Option 1', id: '1'}],
        class_name: 'my-select',
        id: 'my_select_id'
    }
);

// Загрузка собственного шаблона из папки templates
self.render(
    {
        href: 'templates/template.twig',
        base_path: self.params.path,
        load: function(template) {
            var html = template.render({param1: 'value1'});
            // Добавление html в DOM
        }
    },
    {}
);
```

**Доступные системные шаблоны:**
- `select`, `textarea`, `suggest`, `radio`, `multiselect`, `date_field`, `checkbox`, `checkboxes_dropdown`, `file`, `button`, `cancel_button`, `delete_button`, `input`

**`self.render_template(options, params)`** - отображение в правой колонке:
```javascript
self.render_template({
    caption: {
        class_name: 'my-widget-caption'
    },
    body: '<div>HTML разметка</div>',
    render: '' // Или шаблон twig
}, {
    name: "Widget Name"
});
```

##### Работа с источниками и действиями

**`self.add_source(source_type, handler)`** - добавление источника:
```javascript
self.add_source("sms", function(params) {
    // params: { phone, message, contact_id }
    // Функция должна возвращать Promise
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: '/widgets/' + self.system().subdomain + '/loader/' + 
                 self.get_settings().widget_code + '/send_sms',
            method: 'POST',
            data: params,
            success: function() {
                resolve(); // При успехе автоматически создается примечание типа 'sms'
            },
            error: function() {
                reject();
            }
        });
    });
});
```

**`self.add_action(type, action)`** - добавление действия:
```javascript
self.add_action("phone", function() {
    // Код взаимодействия с виджетом телефонии
});

self.add_action("e-mail", function() {
    // Код для работы с email
});
```

##### Другие полезные методы

**`self.widgetsOverlay(show)`** - управление оверлеем:
```javascript
self.widgetsOverlay(true);  // Показать оверлей
self.widgetsOverlay(false); // Скрыть оверлей
```

**`self.crm_post(url, data, callback, type)`** - отправка запросов через прокси:
```javascript
self.crm_post(
    'http://example.com/api',
    {
        name: 'value',
        data: 'data'
    },
    function(response) {
        console.log(response);
    },
    'json' // Тип данных: "xml", "html", "script", "json", "jsonp", "text"
);
```

#### Алгоритм отслеживания изменений страницы и запуска действий

Для отслеживания изменений на странице (добавление, изменение, перемещение элементов) и автоматического запуска действий (например, покраска и группировка задач) используется комбинация нескольких методов:

##### 1. Перехват AJAX/Fetch/XMLHttpRequest запросов

**`interceptWidgetsListAjax()`** - перехватывает все AJAX запросы, которые могут изменить данные на странице:

```javascript
interceptWidgetsListAjax: function() {
    // Перехват jQuery AJAX
    if (typeof $ !== 'undefined' && $.ajax) {
        var originalAjax = $.ajax;
        $.ajax = function(options) {
            var url = options.url || '';
            // Проверка URL на релевантные запросы
            if (url.match(/\/ajax\/(widgets\/list|v2_5\/tasks|todo\/line)/) || 
                url.match(/\/api\/v4\/tasks/) ||
                url.match(/\/ajax\/tasks/)) {
                
                var originalSuccess = options.success;
                options.success = function(data, textStatus, jqXHR) {
                    // Извлечение данных из ответа
                    if (self.callbacks.extractTaskDataFromResponse) {
                        self.callbacks.extractTaskDataFromResponse(data);
                    }
                    // Обновление цветов после изменения
                    if (self.callbacks.updateColorsAfterTaskChange) {
                        self.callbacks.updateColorsAfterTaskChange();
                    }
                    // Сортировка после обновления
                    if (self.callbacks.sortTasksByPriority) {
                        setTimeout(function() {
                            self.callbacks.sortTasksByPriority();
                        }, 400);
                    }
                    if (originalSuccess) {
                        originalSuccess.apply(this, arguments);
                    }
                };
            }
            return originalAjax.apply(this, arguments);
        };
    }
    
    // Перехват Fetch API
    if (typeof window.fetch === 'function') {
        var originalFetch = window.fetch;
        window.fetch = function() {
            var args = Array.prototype.slice.call(arguments);
            var url = args[0];
            if (typeof url === 'string' && url.match(/\/ajax\/(widgets\/list|v2_5\/tasks)/)) {
                return originalFetch.apply(this, args).then(function(response) {
                    var clonedResponse = response.clone();
                    clonedResponse.json().then(function(data) {
                        if (self.callbacks.extractTaskDataFromResponse) {
                            self.callbacks.extractTaskDataFromResponse(data);
                        }
                        if (self.callbacks.updateColorsAfterTaskChange) {
                            self.callbacks.updateColorsAfterTaskChange();
                        }
                    });
                    return response;
                });
            }
            return originalFetch.apply(this, args);
        };
    }
    
    // Перехват XMLHttpRequest
    if (typeof window.XMLHttpRequest !== 'undefined') {
        var originalOpen = XMLHttpRequest.prototype.open;
        var originalSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url) {
            this._url = url;
            return originalOpen.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.send = function() {
            if (this._url && this._url.match(/\/ajax\/(widgets\/list|v2_5\/tasks)/)) {
                this.addEventListener('load', function() {
                    if (this.status >= 200 && this.status < 300) {
                        try {
                            if (this.responseText) {
                                var data = JSON.parse(this.responseText);
                                if (self.callbacks.extractTaskDataFromResponse) {
                                    self.callbacks.extractTaskDataFromResponse(data);
                                }
                                if (self.callbacks.updateColorsAfterTaskChange) {
                                    self.callbacks.updateColorsAfterTaskChange();
                                }
                            }
                        } catch(e) {
                            // Игнорировать ошибки парсинга
                        }
                    }
                });
            }
            return originalSend.apply(this, arguments);
        };
    }
}
```

##### 2. Извлечение данных из ответов AJAX

**`extractTaskDataFromResponse(data)`** - извлекает данные задач из различных форматов ответов:

```javascript
extractTaskDataFromResponse: function(data) {
    if (!data || typeof data !== 'object') {
        return;
    }
    
    var mappingUpdated = false;
    
    // Структура 1: data.response.tasks
    if (data.response && data.response.tasks) {
        var tasks = data.response.tasks;
        if (Array.isArray(tasks)) {
            tasks.forEach(function(task) {
                if (task && task.id && task.task_type_id) {
                    var taskId = task.id.toString().replace(/^id_/, '');
                    self.callbacks.taskTypeMapping[taskId] = task.task_type_id;
                    mappingUpdated = true;
                }
            });
        }
    }
    
    // Структура 2: data._embedded.tasks (API v4)
    if (data._embedded && data._embedded.tasks && Array.isArray(data._embedded.tasks)) {
        data._embedded.tasks.forEach(function(task) {
            if (task && task.id && task.task_type_id) {
                var taskId = task.id.toString().replace(/^id_/, '');
                self.callbacks.taskTypeMapping[taskId] = task.task_type_id;
                mappingUpdated = true;
            }
        });
    }
    
    // Структура 3: data.response.items (todo/line format)
    if (data.response && data.response.items) {
        var items = data.response.items;
        for (var category in items) {
            if (items.hasOwnProperty(category)) {
                for (var key in items[category]) {
                    var task = items[category][key];
                    if (task && task.id && (task.task_type_id || task.type)) {
                        var taskId = task.id.toString().replace(/^id_/, '');
                        var taskTypeId = task.task_type_id || task.type;
                        self.callbacks.taskTypeMapping[taskId] = taskTypeId;
                        mappingUpdated = true;
                    }
                }
            }
        }
    }
    
    return mappingUpdated;
}
```

##### 3. Обновление после изменения задачи

**`updateColorsAfterTaskChange()`** - обновляет цвета и сортировку после изменения задачи:

```javascript
updateColorsAfterTaskChange: function() {
    // Обновление маппинга из API (с защитой от спама)
    if (self.callbacks.fetchTasksFromAPI) {
        self.callbacks.fetchTasksFromAPI();
    }
    
    // Немедленное обновление для быстрого отклика
    if (self.callbacks._restoreColorsForExistingTasks) {
        self.callbacks._restoreColorsForExistingTasks();
    }
    if (self.callbacks.sortTasksByPriority) {
        self.callbacks.sortTasksByPriority();
    }
    
    // Обновление с задержками для надежности
    setTimeout(function() {
        if (self.callbacks._restoreColorsForExistingTasks) {
            self.callbacks._restoreColorsForExistingTasks();
        }
        if (self.callbacks.applyTaskColors) {
            self.callbacks.applyTaskColors();
        }
        if (self.callbacks.sortTasksByPriority) {
            self.callbacks.sortTasksByPriority();
        }
    }, 200);
    
    setTimeout(function() {
        if (self.callbacks._restoreColorsForExistingTasks) {
            self.callbacks._restoreColorsForExistingTasks();
        }
        if (self.callbacks.sortTasksByPriority) {
            self.callbacks.sortTasksByPriority();
        }
    }, 500);
    
    setTimeout(function() {
        if (self.callbacks._restoreColorsForExistingTasks) {
            self.callbacks._restoreColorsForExistingTasks();
        }
        if (self.callbacks.sortTasksByPriority) {
            self.callbacks.sortTasksByPriority();
        }
    }, 1000);
    
    setTimeout(function() {
        if (self.callbacks._restoreColorsForExistingTasks) {
            self.callbacks._restoreColorsForExistingTasks();
        }
        if (self.callbacks.sortTasksByPriority) {
            self.callbacks.sortTasksByPriority();
        }
    }, 2000);
}
```

##### 4. Получение данных из API

**`fetchTasksFromAPI()`** - получает задачи из API для обновления маппинга (с защитой от частых запросов):

```javascript
fetchTasksFromAPI: function() {
    // Защита от спама - не чаще чем раз в 2 секунды
    var now = Date.now();
    if (self.callbacks._lastApiFetch && (now - self.callbacks._lastApiFetch) < 2000) {
        return;
    }
    self.callbacks._lastApiFetch = now;
    
    // Построение URL API
    var urlParams = new URLSearchParams(window.location.search);
    var apiUrl = '/api/v4/tasks';
    if (urlParams.toString()) {
        apiUrl += '?' + urlParams.toString() + '&limit=250';
    } else {
        apiUrl += '?limit=250';
    }
    
    // Запрос к API
    $.ajax({
        url: apiUrl,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response && response._embedded && response._embedded.tasks) {
                var tasks = response._embedded.tasks;
                for (var i = 0; i < tasks.length; i++) {
                    var task = tasks[i];
                    if (task.id && task.task_type_id) {
                        self.callbacks.taskTypeMapping[task.id] = task.task_type_id;
                    }
                }
                
                // Применение цветов и сортировка после обновления маппинга
                setTimeout(function() {
                    if (self.callbacks.applyTaskColors) {
                        self.callbacks.applyTaskColors();
                    }
                    if (self.callbacks.sortTasksByPriority) {
                        self.callbacks.sortTasksByPriority();
                    }
                }, 100);
            }
            
            // Обработка пагинации
            if (response._links && response._links.next) {
                // Загрузка следующей страницы
            }
        }
    });
}
```

##### 5. Отслеживание изменений DOM через MutationObserver

**`watchForNewTasks()`** - использует MutationObserver для отслеживания добавления/изменения элементов в DOM:

```javascript
watchForNewTasks: function() {
    if (typeof MutationObserver === 'undefined') {
        return;
    }
    
    var observer = new MutationObserver(function(mutations) {
        var hasNewTasks = false;
        var hasAttributeChanges = false;
        
        mutations.forEach(function(mutation) {
            // Проверка новых узлов
            if (mutation.addedNodes.length > 0) {
                hasNewTasks = true;
            }
            // Проверка удаленных узлов (задачи перемещены)
            if (mutation.removedNodes.length > 0) {
                hasNewTasks = true;
            }
            // Проверка изменений атрибутов (стили могут быть сброшены)
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                hasAttributeChanges = true;
            }
        });
        
        // Если обнаружены изменения, обновляем цвета и сортируем
        if (hasNewTasks || hasAttributeChanges) {
            if (hasNewTasks) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            var $node = $(node);
                            // Проверка, является ли узел задачей
                            if ($node.hasClass('todo-line__item')) {
                                // Обновление маппинга из API
                                if (self.callbacks.fetchTasksFromAPI) {
                                    var now = Date.now();
                                    if (!self.callbacks._lastApiFetch || 
                                        (now - self.callbacks._lastApiFetch) > 2000) {
                                        self.callbacks._lastApiFetch = now;
                                        self.callbacks.fetchTasksFromAPI();
                                    }
                                }
                                
                                // Применение цвета к новой задаче
                                setTimeout(function() {
                                    applyColorToTask($node);
                                    if (self.callbacks.sortTasksByPriority) {
                                        self.callbacks.sortTasksByPriority();
                                    }
                                }, 100);
                            }
                        }
                    });
                });
            }
            
            // Восстановление цветов для всех задач
            restoreColorsForExistingTasks();
            if (self.callbacks.sortTasksByPriority) {
                self.callbacks.sortTasksByPriority();
            }
            
            // Дополнительные вызовы с задержками для надежности
            setTimeout(function() {
                restoreColorsForExistingTasks();
                if (self.callbacks.sortTasksByPriority) {
                    self.callbacks.sortTasksByPriority();
                }
            }, 100);
            setTimeout(function() {
                restoreColorsForExistingTasks();
                if (self.callbacks.sortTasksByPriority) {
                    self.callbacks.sortTasksByPriority();
                }
            }, 500);
        }
    });
    
    // Начало наблюдения за контейнерами
    setTimeout(function() {
        // Наблюдение за основным контейнером задач
        var $todoContainer = $('.todo-list, .todo-line, [class*="todo"]').first();
        if ($todoContainer.length > 0) {
            observer.observe($todoContainer[0], {
                childList: true,      // Отслеживание добавления/удаления дочерних элементов
                subtree: true,        // Отслеживание всех потомков
                attributes: true,     // Отслеживание изменений атрибутов
                attributeFilter: ['style', 'class', 'data-id']
            });
        }
        
        // Также наблюдение за document.body для отслеживания перемещений между днями
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class', 'data-id']
            });
        }
        
        // Периодическое восстановление цветов (каждые 300мс)
        // Обеспечивает восстановление даже если MutationObserver что-то пропустил
        var restoreInterval = setInterval(function() {
            if (!window.location.pathname.match(/\/todo\/line/)) {
                clearInterval(restoreInterval);
                return;
            }
            restoreColorsForExistingTasks();
            if (self.callbacks.sortTasksByPriority) {
                self.callbacks.sortTasksByPriority();
            }
        }, 300);
    }, 1000);
}
```

##### 6. Применение цветов к задачам

**`applyTaskColors()`** - применяет цвета ко всем задачам на странице:

```javascript
applyTaskColors: function() {
    // Загрузка сохраненных цветов из настроек
    var savedColors = {};
    var taskTypesEnabled = {};
    var settings = self.get_settings();
    
    if (settings && settings.task_types_enabled) {
        // Парсинг настроек цветов
        var enabledValue = settings.task_types_enabled;
        if (typeof enabledValue === 'string') {
            enabledValue = JSON.parse(enabledValue);
        }
        
        // Парсинг формата: {"1":{"enabled":true,"color":"#999999"},...}
        if (typeof enabledValue === 'object' && enabledValue !== null) {
            for (var key in enabledValue) {
                if (enabledValue.hasOwnProperty(key)) {
                    var data = enabledValue[key];
                    if (data && typeof data === 'object' && data.enabled !== undefined) {
                        taskTypesEnabled[key] = data.enabled;
                        if (data.color) {
                            savedColors[key] = data.color;
                        }
                    }
                }
            }
        }
    }
    
    // Применение цветов ко всем задачам
    var $tasks = $('.todo-line__item');
    $tasks.each(function() {
        var $task = $(this);
        var taskId = $task.attr('data-id') || $task.attr('id');
        if (taskId && taskId.toString().startsWith('id_')) {
            taskId = taskId.toString().substring(3);
        }
        taskId = taskId ? parseInt(taskId) : null;
        
        // Получение типа задачи из маппинга
        var taskTypeId = null;
        if (taskId && self.callbacks.taskTypeMapping) {
            taskTypeId = self.callbacks.taskTypeMapping[taskId];
        }
        
        // Применение цвета, если тип найден и цвет включен
        if (taskTypeId && savedColors[taskTypeId]) {
            var isEnabled = taskTypesEnabled[taskTypeId] !== false;
            if (isEnabled) {
                var color = savedColors[taskTypeId];
                $task[0].style.setProperty('background-color', color, 'important');
                $task.addClass('task-types-widget-colored');
                
                // Установка цвета текста на основе яркости фона
                var textColor = self.callbacks.getTextColorForBackground(color);
                $task[0].style.setProperty('color', textColor, 'important');
            }
        }
    });
    
    // Сортировка после применения цветов
    if (self.callbacks.sortTasksByPriority) {
        self.callbacks.sortTasksByPriority();
    }
}
```

##### 7. Сортировка задач (с debounce)

**`sortTasksByPriority()`** - сортирует задачи по приоритету с защитой от частых вызовов:

```javascript
sortTasksByPriority: function() {
    // Debounce: предотвращение слишком частых вызовов
    if (self.callbacks._sortTasksByPriorityTimeout) {
        clearTimeout(self.callbacks._sortTasksByPriorityTimeout);
    }
    
    // Вызов с задержкой 300мс
    self.callbacks._sortTasksByPriorityTimeout = setTimeout(function() {
        if (self.callbacks._sortTasksByPriorityActual) {
            self.callbacks._sortTasksByPriorityActual();
        }
    }, 300);
}

_sortTasksByPriorityActual: function() {
    // Реальная логика сортировки
    // Сортировка задач по приоритету на основе настроек
    // ...
}
```

##### Инициализация всех методов

В методе `init()` все методы инициализируются:

```javascript
init: function() {
    if (window.location.pathname.match(/\/todo\/line/)) {
        // 1. Установка перехватчика AJAX
        if (self.callbacks.interceptWidgetsListAjax) {
            self.callbacks.interceptWidgetsListAjax();
        }
        
        // 2. Получение задач из API
        if (self.callbacks.fetchTasksFromAPI) {
            self.callbacks.fetchTasksFromAPI();
            setTimeout(function() {
                self.callbacks.fetchTasksFromAPI();
            }, 1000);
        }
        
        // 3. Применение цветов и сортировка
        setTimeout(function() {
            if (self.callbacks.applyTaskColors) {
                self.callbacks.applyTaskColors();
            }
            if (self.callbacks.sortTasksByPriority) {
                self.callbacks.sortTasksByPriority();
            }
            // 4. Запуск отслеживания изменений DOM
            if (self.callbacks.watchForNewTasks) {
                self.callbacks.watchForNewTasks();
            }
        }, 500);
    }
    return true;
}
```

**Итоговая схема работы:**

1. **Перехват AJAX запросов** → извлечение данных → обновление маппинга → применение цветов → сортировка
2. **MutationObserver** → обнаружение изменений DOM → обновление маппинга → применение цветов → сортировка
3. **Периодическая проверка** (каждые 300мс) → восстановление цветов → сортировка
4. **API запросы** → обновление маппинга → применение цветов → сортировка

Все методы используют debounce/throttle для оптимизации производительности и защиты от избыточных вызовов.

#### Подключение CSS файлов

Для избежания проблем с кэшированием CSS файлов, необходимо передавать версию виджета в качестве параметра:

```javascript
init: function() {
    var settings = self.get_settings();
    var version = self.get_version();
    
    if ($('link[href="' + settings.path + '/style.css?v=' + version + '"]').length < 1) {
        $("head").append(
            '<link href="' + settings.path + '/style.css?v=' + version + 
            '" type="text/css" rel="stylesheet">'
        );
    }
    
    return true;
}
```

#### Получение настроек виджета вне script.js

Если виджет состоит из нескольких модулей, настройки можно сохранить в хелпере:

```javascript
// lib/settings_helper.js
define([], function() {
    var settings = {};
    return {
        set: function(widget_settings) {
            settings = widget_settings;
        },
        get: function() {
            return settings;
        }
    };
});

// script.js
define(['jquery', './lib/settings_helper.js'], function($, settings_helper) {
    return function() {
        var self = this;
        
        settings_helper.set(self.get_settings());
        
        this.callbacks = {
            init: function() {
                var settings = settings_helper.get();
                return true;
            }
        };
        
        return this;
    };
});
```

---

## Конфигурационные файлы

### config.json (опциональный)

Дополнительный конфигурационный файл для хранения метаданных виджета.

```json
{
    "code": "widget_code",
    "version": 1,
    "widget_class": "widget-class",
    "locales": ["ru", "en"]
}
```

**Примечание:** Значения в `config.json` должны соответствовать значениям в `script.js` для обеспечения консистентности.

---

## Локализация

### Структура файлов локализации

Файлы локализации находятся в директории `i18n/` и имеют формат JSON с расширением `.json`, где имя файла соответствует коду языка (например, `ru.json`, `en.json`).

### Структура файла локализации:

```json
{
    "widget": {
        "name": "Название виджета",
        "short_description": "Краткое описание",
        "description": "Полное описание виджета"
    },
    "settings": {
        "setting_key": "Название настройки",
        "setting_description": "Описание настройки"
    },
    "advanced": {
        "title": "Заголовок расширенных настроек"
    }
}
```

### Критические требования к локализации

**КРИТИЧЕСКИ ВАЖНО:**
- **Все ключи, указанные в `manifest.json`, ОБЯЗАТЕЛЬНО должны присутствовать во ВСЕХ файлах локализации**
- Если ключ из `manifest.json` отсутствует хотя бы в одном файле локализации, загрузка архива виджета завершится **ошибкой**
- Структура всех файлов локализации должна быть идентичной
- Поддерживаемые языки должны быть указаны в `manifest.json` в поле `locale`
- Для каждого языка из `locale` должен существовать соответствующий файл в директории `i18n/`

**Пример ошибки:**
Если в `manifest.json` указан ключ `"widget.name"`, но в файле `i18n/en.json` отсутствует соответствующее значение в секции `widget.name`, то при попытке загрузить архив виджета возникнет ошибка валидации.

### Использование локализации в коде

Ключи локализации из `manifest.json` должны соответствовать ключам в файлах локализации. amoCRM автоматически подставляет значения на основе текущего языка пользователя.

---

## Дополнительные ресурсы

### Изображения

Изображения виджета (логитипы, иконки) размещаются в директории `images/`.

**Рекомендуемые изображения:**
- `logo.png` - основной логотип виджета
- `logo_small.png` - маленький логотип (для списков)
- `logo_min.png` - минимальный логотип
- `logo_main.png` - главный логотип

**Форматы:** PNG, JPG, SVG  
**Размеры:** Рекомендуется использовать изображения с высоким разрешением для поддержки Retina дисплеев.

---

## Процесс разработки

### Шаг 1: Создание структуры директорий

Создайте следующую структуру:

```
my-widget/
├── manifest.json
├── config.json
├── script.js
├── i18n/
│   ├── ru.json
│   └── en.json
└── images/
    └── logo.png
```

### Шаг 2: Настройка manifest.json

1. Заполните метаданные виджета:
   - Название, описание, версия
   - Укажите поддерживаемые языки
   - Определите места отображения (`locations`)

2. **ВАЖНО:** Замените код и ключи на уникальные:
   - **Перед первой загрузкой** виджета необходимо заменить все примеры кодов и ключей на сгенерированные вами уникальные значения
   - Не используйте примеры из документации — они уже заняты
   - Если виджет был загружен с неверным manifest, предыдущий код и ключ будут дескредитированы — необходимо сгенерировать новые

3. Настройте параметры виджета:
   - Добавьте необходимые настройки в секцию `settings`
   - Укажите типы полей и их обязательность

### Шаг 3: Создание файлов локализации

1. Создайте файлы для каждого языка в `i18n/` (например, `ru.json`, `en.json`)
2. **ОБЯЗАТЕЛЬНО заполните ВСЕ ключи, используемые в `manifest.json`, во ВСЕХ файлах локализации**
   - Если ключ есть в `manifest.json`, но отсутствует в каком-либо файле локализации, загрузка архива завершится ошибкой
   - Проверьте все ключи из секций: `widget.*`, `settings.*`, `advanced.*`
3. Убедитесь, что структура полностью идентична во всех файлах локализации
4. Проверьте, что для каждого языка из `locale` в `manifest.json` существует соответствующий файл

### Шаг 4: Разработка script.js

1. Создайте базовую структуру с AMD модулем
2. Реализуйте обязательные методы:
   - `init()` - инициализация
   - `bind_actions()` - привязка событий
   - `render()` - рендеринг
   - `onSave()` - сохранение настроек
   - `settings()` - интерфейс настроек
   - `destroy()` - очистка

3. Добавьте бизнес-логику виджета

### Шаг 5: Тестирование

1. Установите виджет в тестовую аккаунт amoCRM
2. Проверьте работу всех методов
3. Протестируйте локализацию
4. Проверьте сохранение и загрузку настроек

### Шаг 6: Оптимизация

1. Оптимизируйте производительность
2. Убедитесь в отсутствии утечек памяти
3. Проверьте совместимость с разными версиями amoCRM

### Шаг 7: Проверка перед упаковкой

**КРИТИЧЕСКИ ВАЖНО:** Выполните все проверки перед упаковкой виджета в архив.

1. **Проверка синтаксиса JSON:**
   - Проверьте все JSON файлы через онлайн-валидатор (jsonlint.com, jsonformatter.org)
   - Убедитесь, что нет синтаксических ошибок в:
     - `manifest.json`
     - `config.json` (если используется)
     - Всех файлах в `i18n/`

2. **Проверка кодировки:**
   - Убедитесь, что все файлы сохранены в кодировке **UTF-8 без BOM**
   - Проверьте в редакторе кодировку каждого файла

3. **Проверка локализации:**
   - Убедитесь, что все ключи из `manifest.json` присутствуют во всех файлах локализации
   - Проверьте идентичность структуры всех языковых файлов

4. **Проверка уникальности:**
   - Убедитесь, что в `manifest.json` указаны уникальные код и ключи (не из примеров)

### Шаг 8: Упаковка в архив

1. Выберите все файлы и папки виджета:
   - `manifest.json`
   - `script.js`
   - `config.json` (если используется)
   - Папка `i18n/` со всеми файлами
   - Папка `images/` (если используется)

2. **ВАЖНО:** Создайте ZIP архив так, чтобы файлы находились **непосредственно в корне архива**, без дополнительной папки `widget`

3. Правильная структура архива:
   ```
   widget-archive.zip
   ├── manifest.json
   ├── script.js
   ├── config.json
   ├── i18n/
   │   ├── ru.json
   │   └── en.json
   └── images/
       └── logo.png
   ```

4. **Неправильная структура** (будет ошибка):
   ```
   widget-archive.zip
   └── widget/          ← НЕПРАВИЛЬНО!
       ├── manifest.json
       └── ...
   ```

---

## Типовые ошибки и их решение

При разработке и загрузке виджетов в amoCRM часто возникают следующие ошибки. Внимательно изучите этот раздел, чтобы избежать проблем при загрузке виджета.

### 1. Некорректный синтаксис JSON

**Проблема:** Одна из самых частых ошибок — загрузка файлов с некорректным синтаксисом JSON.

**Решение:**
- Перед загрузкой виджета **обязательно проверьте** все JSON файлы на корректность синтаксиса
- Используйте онлайн-валидаторы JSON (например, jsonlint.com, jsonformatter.org)
- Проверьте следующие файлы:
  - `manifest.json`
  - `config.json` (если используется)
  - Все файлы в директории `i18n/` (`ru.json`, `en.json` и т.д.)

**Как проверить:**
1. Откройте файл в текстовом редакторе
2. Скопируйте содержимое
3. Вставьте в онлайн-валидатор JSON
4. Убедитесь, что нет ошибок синтаксиса (лишние запятые, незакрытые скобки, кавычки и т.д.)

### 2. Неправильная кодировка файлов

**Проблема:** Файлы должны быть в кодировке UTF-8 без BOM (Byte Order Mark).

**Решение:**
- **Все файлы виджета** должны быть сохранены в кодировке **UTF-8 без BOM**
- Это касается:
  - `manifest.json`
  - `config.json`
  - `script.js`
  - Всех файлов в `i18n/`
  - Любых других текстовых файлов

**Как проверить и исправить:**
- В большинстве редакторов (VS Code, Sublime Text, Notepad++) можно выбрать кодировку при сохранении
- Убедитесь, что выбран вариант "UTF-8" или "UTF-8 without BOM"
- Избегайте "UTF-8 with BOM" — это может вызвать проблемы

### 3. Использование примеров кода и ключей

**Проблема:** В манифесте используются примеры кода и ключей из документации вместо уникальных значений.

**Решение:**
- **Перед первой загрузкой** виджета в `manifest.json` необходимо заменить:
  - Код виджета на уникальный код, сгенерированный вами
  - Ключи на уникальные ключи, сгенерированные вами
- Не используйте примеры из документации — они уже заняты

**Важно:**
- Если изначально был загружен неверный `manifest.json`, то необходимо сгенерировать **новый код и ключ**
- Предыдущий код и ключ будут дескредитированы и не могут быть использованы повторно

### 4. Неправильная структура архива

**Проблема:** В упакованном архиве в корне лежит папка `widget`, а файлы находятся внутри неё.

**Решение:**
- При упаковке виджета в архив (ZIP) файлы должны находиться **непосредственно в корне архива**
- Структура архива должна быть такой:

```
widget-archive.zip
├── manifest.json
├── config.json
├── script.js
├── i18n/
│   ├── ru.json
│   └── en.json
└── images/
    └── logo.png
```

**Неправильная структура:**
```
widget-archive.zip
└── widget/              ← НЕПРАВИЛЬНО! Папка widget не нужна
    ├── manifest.json
    ├── script.js
    └── ...
```

**Как правильно упаковать:**
1. Выберите все файлы и папки виджета (manifest.json, script.js, i18n/, images/)
2. Создайте ZIP архив из этих файлов
3. Убедитесь, что при открытии архива файлы видны сразу, без дополнительной папки

### 5. Отсутствие обязательных ключей локализации

**Проблема:** Ключи из `manifest.json` отсутствуют в файлах локализации.

**Решение:**
- Все ключи из `manifest.json` должны присутствовать во всех файлах локализации
- Если ключ из `manifest.json` отсутствует хотя бы в одном файле локализации, загрузка архива виджета завершится ошибкой
- Структура всех файлов локализации должна быть идентичной

### Чек-лист перед загрузкой виджета

Перед загрузкой виджета в amoCRM проверьте:

- [ ] Все JSON файлы проверены на корректность синтаксиса (использован валидатор)
- [ ] Все файлы сохранены в кодировке UTF-8 без BOM
- [ ] В `manifest.json` указаны уникальные код и ключи (не из примеров)
- [ ] Все ключи из `manifest.json` присутствуют во всех файлах локализации
- [ ] Структура архива правильная — файлы в корне, без папки `widget`
- [ ] Все обязательные файлы присутствуют (manifest.json, script.js, i18n/)
- [ ] Версия виджета обновлена (если это обновление существующего виджета)

---

## Важные замечания

### Совместимость
- Виджет должен быть совместим с версией интерфейса, указанной в `interface_version`
- Используйте только публичные API amoCRM
- Избегайте прямого изменения DOM элементов amoCRM без необходимости

### Производительность
- Минимизируйте количество DOM операций
- Используйте debounce/throttle для частых операций
- Очищайте обработчики событий в методе `destroy()`

### Безопасность
- Валидируйте все пользовательские данные
- Используйте экранирование для предотвращения XSS
- Не храните чувствительные данные в виджете

### Обработка ошибок
- Всегда обрабатывайте возможные ошибки
- Используйте try-catch для критических операций
- Логируйте ошибки для отладки (в режиме разработки)

---

## Примеры использования

### Пример 1: Простой виджет с настройками

```javascript
define(['jquery'], function($) {
    'use strict';
    
    return function() {
        var self = this;
        
        this.code = 'my_widget';
        this.widget_class = 'my-widget';
        
        this.callbacks = {
            init: function() {
                console.log('Widget initialized');
                return true;
            },
            
            bind_actions: function() {
                $(document).on('click', '.my-widget-button', function() {
                    alert('Button clicked!');
                });
                return true;
            },
            
            render: function() {
                var $container = $('#work-area-' + self.code);
                if ($container.length === 0) {
                    $container = $('<div id="work-area-' + self.code + '"></div>');
                    $('#work-area').append($container);
                }
                $container.html('<div class="my-widget"><button class="my-widget-button">Click me</button></div>');
                return true;
            },
            
            onSave: function(params) {
                console.log('Settings saved:', params);
                return true;
            },
            
            settings: function() {
                var $container = $('#work-area-' + self.code);
                $container.html('<div>Settings page</div>');
                return true;
            },
            
            destroy: function() {
                $(document).off('click', '.my-widget-button');
            }
        };
        
        return this;
    };
});
```

### Пример 2: Проверка согласия на передачу данных

Для проверки согласия пользователя на передачу данных можно использовать поле типа `custom` в настройках виджета.

**manifest.json:**
```json
{
    "widget": {
        "code": "my_widget"
    },
    "locations": ["settings", "everywhere"],
    "settings": {
        "oferta": {
            "name": "settings.oferta",
            "type": "custom",
            "required": true
        }
    }
}
```

**script.js:**
```javascript
define(['jquery'], function($) {
    return function() {
        var self = this;
        var widgetCode = 'my_widget'; // или self.get_settings().widget_code
        
        this.callbacks = {
            render: function() {
                return true;
            },
            
            init: function() {
                return true;
            },
            
            bind_actions: function() {
                return true;
            },
            
            settings: function($modal_body) {
                // Получаем контейнер для кастомного контента и hidden input
                // После загрузки виджета доступны:
                // - div с ID <код виджета>_custom_content
                // - hidden input с ID <код виджета>_custom
                var $customContent = $('#' + widgetCode + '_custom_content');
                var $customInput = $('#' + widgetCode + '_custom');
                
                // Добавляем свой контент в контейнер
                $customContent.html(
                    '<div class="oferta">' +
                    '<label for="oferta_check" class="oferta_title">' +
                    'Подтвердите согласие на передачу данных аккаунта на сторонний сервер' +
                    '</label>' +
                    '<input type="checkbox" id="oferta_check" />' +
                    '<div class="oferta_error hidden">Необходимо дать согласие</div>' +
                    '</div>'
                );
                
                var $install_btn = $('button.js-widget-install');
                var $oferta_error = $customContent.find('.oferta_error');
                
                // Загружаем сохраненное значение (если есть)
                var savedValue = $customInput.val();
                if (savedValue) {
                    $customContent.find('#oferta_check').prop('checked', savedValue == 1);
                }
                
                // Обработчик изменения чекбокса
                $customContent.find('#oferta_check').on('change', function() {
                    var $checkbox = $(this);
                    var value = $checkbox.prop('checked') ? 1 : 0;
                    
                    // Сохраняем значение в hidden input
                    // Важно: поле может содержать только JSON-строку либо число
                    $customInput.val(value);
                    
                    // Важно: создаем событие change на системном инпуте,
                    // чтобы изменения отражались в форме и ее кнопках
                    $('input[name="oferta"]').trigger('change');
                    
                    if ($checkbox.prop('checked')) {
                        $oferta_error.addClass('hidden');
                    }
                });
                
                // Проверка при нажатии на "Установить"
                $install_btn.on('click', function() {
                    if (!$customInput.val() || $customInput.val() == '0') {
                        $oferta_error.removeClass('hidden');
                    }
                });
                
                return true;
            },
            
            onSave: function() {
                return true;
            },
            
            destroy: function() {
                return true;
            }
        };
        
        return this;
    };
});
```

---

## Заключение

Создание виджета для amoCRM требует понимания структуры файлов, обязательных методов и процесса локализации. Следуя этой документации, вы сможете создать функциональный и совместимый виджет для amoCRM.

Для получения дополнительной информации обращайтесь к официальной документации amoCRM API.
