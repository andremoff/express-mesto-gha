[![Tests](../../actions/workflows/tests-13-sprint.yml/badge.svg)](../../actions/workflows/tests-13-sprint.yml) [![Tests](../../actions/workflows/tests-14-sprint.yml/badge.svg)](../../actions/workflows/tests-14-sprint.yml)
# Проект "Express Mesto GHA" фронтенд + бэкенд

Это проект "Express Mesto GHA" — учебное приложение для создания и управления коллекцией фотографий. Приложение "Express Mesto GHA" позволяет пользователям создавать аккаунты, загружать фотографии, просматривать фотографии других пользователей, ставить лайки и многое другое. Пользователи могут редактировать свои профили, добавлять новые карточки с изображениями и управлять своей коллекцией фотографий. Ниже приведена информация о технологиях, модулях, базе данных и приложениях, использованных в проекте.  

## Технологии

В проекте "Express Mesto GHA" использовались следующие технологии:

* `Node.js:` среда выполнения JavaScript на сервере.
* `Express.js:` веб-фреймворк для создания серверных приложений на Node.js.
* `MongoDB:` нереляционная база данных, используемая для хранения информации о пользователях и карточках.
* `Mongoose:` объектно-документальная модель (ODM) для работы с MongoDB в Node.js.
* `Postman:` инструмент для тестирования API и отправки HTTP-запросов.
* `Helmet:` набор middleware функций для обеспечения безопасности вашего приложения Node.js.
* `Validator:` библиотека для валидации данных, включая проверку URL.

## Директории

* `app.js:` основной файл приложения, содержащий настройку сервера и подключение к базе данных.
* `models/user.js:` модель пользователя, определяющая схему и методы работы с данными о пользователях.
* `models/card.js:` модель карточки, определяющая схему и методы работы с данными о карточках.
* `controllers/users.js:` контроллеры для обработки запросов, связанных с пользователями, такие как получение пользователей, создание пользователя, обновление профиля и другие.
* `controllers/cards.js:` контроллеры для обработки запросов, связанных с карточками, такие как получение карточек, создание карточки, удаление карточки и другие.
* `routes/users.js:` маршруты для обработки запросов, связанных с пользователями, такие как получение пользователей, создание пользователя, обновление профиля и другие.
* `routes/cards.js:` маршруты для обработки запросов, связанных с карточками, такие как получение карточек, создание карточки, удаление карточки и другие. 
  
Остальные директории вспомогательные, создаются при необходимости разработчиком

## База данных

В проекте "Express Mesto GHA" используется MongoDB в качестве базы данных. База данных называется "mestodb". Для подключения к базе данных используется `URL: mongodb://localhost:27017/mestodb`. В проекте используется библиотека Mongoose для работы с MongoDB.

## Запуск проекта

Чтобы установить и запустить проект "Express Mesto GHA", выполните следующие шаги:

1. Убедитесь, что у вас установлен Node.js и MongoDB.
2. Склонируйте репозиторий проекта на свой компьютер.
3. В командной строке перейдите в папку проекта.
4. Установите зависимости, выполнив команду npm install.
5. Запустите сервер разработки, выполнив команду npm run dev.

## Автор

* **Андрей Дремов** - [andremoff](https://github.com/andremoff)
* **Проектная работа** - [express-mesto-gha](https://andremoff.github.io/express-mesto-gha/)
