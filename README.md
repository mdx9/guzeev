# Сравнение подходов к разработке API: GraphQL vs REST API
## Реализация проекта Rest API
Подробный пошаговый план, как создать и запустить простой REST API на Node.js с использованием Express.
### 1.Создать новую папку проекта и инициализировать npm
```bash
mkdir rest-api
cd rest-api
npm init -y
```
### 2. Установите необходимые зависимости
```bash
npm install express
```
express — веб-фреймворк для Node.js
### 3.Создайте структуру проекта
```text
rest-api/
│
├── app.js
├── routes/
│   └── users.js
└── controllers/
    └── usersController.js
```
### 4.Создайте файл controllers/usersController.js — логика обработки запросов
``` javascript
// Временное хранилище пользователей в памяти (массив)
// Данные будут сбрасываться при перезапуске сервера
const users = [];
// Счетчик для генерации уникальных ID новых пользователей
let idCounter = 1;

// Контроллер для получения всех пользователей
exports.getUsers = (req, res) => {
  // Отправляем весь массив пользователей в формате JSON
  res.json(users);
};

// Контроллер для получения пользователя по ID
exports.getUserById = (req, res) => {
  // Ищем пользователя по ID из параметров запроса
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  // Если пользователь не найден - отправляем ошибку 404
  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }
  
  // Отправляем найденного пользователя
  res.json(user);
};

// Контроллер для создания нового пользователя
exports.createUser = (req, res) => {
  // Извлекаем данные из тела запроса
  const { name, email, age } = req.body;
  
  // Проверка обязательных полей
  if (!name || !email) {
    return res.status(400).json({ error: "Необходимы name и email" });
  }
  
  // Создаем объект нового пользователя
  const newUser = {
    id: idCounter++, // Автоматически генерируем ID
    name,            // Имя из тела запроса
    email,           // Email из тела запроса
    age: age || null // Возраст (если не указан - null)
  };
  
  // Добавляем пользователя в массив
  users.push(newUser);
  
  // Отправляем созданного пользователя с кодом 201 (Created)
  res.status(201).json(newUser);
};

// Примечание: В реальных приложениях вместо хранения в памяти 
// следует использовать базу данных для постоянного хранения данных
```
### 5. Создайте файл routes/users.js — маршруты для пользователей
```javascript
// Импорт модуля Express и создание экземпляра роутера
// Роутер позволяет группировать связанные маршруты и middleware
const express = require('express');
const router = express.Router();

// Импорт контроллера пользователей, содержащего логику обработки запросов
const usersController = require('../controllers/usersController');

// Маршрут GET / - получение списка всех пользователей
// Обработчик запроса: usersController.getUsers
router.get('/', usersController.getUsers);

// Маршрут GET /:id - получение конкретного пользователя по ID
// :id - динамический параметр, доступный через req.params.id
// Обработчик запроса: usersController.getUserById
router.get('/:id', usersController.getUserById);

// Маршрут POST / - создание нового пользователя
// Данные пользователя передаются в теле запроса (req.body)
// Обработчик запроса: usersController.createUser
router.post('/', usersController.createUser);

// Экспорт роутера для использования в основном приложении
// Этот роутер будет подключен по пути /api/users в основном файле
module.exports = router;
```
### 6.Создайте файл app.js — основной файл сервера
```javascript
// Импорт модуля Express для создания REST API сервера
const express = require('express');
// Создание экземпляра Express-приложения
const app = express();

// Импорт маршрутов для работы с пользователями из отдельного файла
const usersRoutes = require('./routes/users');

// Middleware для автоматического парсинга JSON-тела входящих запросов
// Позволяет работать с данными из POST/PUT/PATCH-запросов в формате JSON
app.use(express.json());

// Подключение маршрутов для работы с пользователями
// Все запросы начинающиеся с /api/users будут перенаправлены в usersRoutes
app.use('/api/users', usersRoutes);

// Порт, на котором будет работать сервер
const PORT = 3000;
// Запуск сервера с выводом сообщения при успешном старте
app.listen(PORT, () => {
  console.log(`REST API сервер запущен на http://localhost:${PORT}`);
});
```

### 7.  Запустите сервер
```bash
node app.js
```
### 8. Конечный результат
После запуска сервера можно выполнять HTTP-запросы к API по адресу 
http://localhost:3000/api/users.

### 9. Выполнение запросов
Пример запроса создания пользователя (POST) в другом терминале tty2
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Иван Иванов", "email": "ivan@example.com", "age": 30}'
```
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Цыганков Роман", "email": "tsygankov@bk.ru", "age": 23}'

```
Пример запроса получения списка пользователей (GET):
```bash
curl http://localhost:3000/api/users
```
Пример запроса получения пользователя по id (GET):
```bash
curl http://localhost:3000/api/users/2
```

## Реализация проекта Graphql
Подробный пошаговый план, как создать и запустить простой GraphQL  на Node.js и Apollo Server. Этот код демонстрирует создание API для блога с возможностью запроса данных и мутаций.
### 1.Создать новую папку проекта и инициализировать npm
```bash
mkdir graphql-test
cd graphql-test
npm init -y
```
### 2. Установите необходимые зависимости
```bash
npm install apollo-server-express express graphql
```
express — веб-фреймворк для Node.js
graphql — ядро GraphQL
### 3. Создайте файл server.js — основной сервер GraphQL
```javascript
// Импорт необходимых модулей Apollo Server и Express
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');

// Временные данные в памяти (замените базой данных в реальном приложении)
const users = [
  { id: '1', name: 'Alice', email: 'alice@example.com', posts: ['1'] },
  { id: '2', name: 'Bob', email: 'bob@example.com', posts: ['2'] },
];

const posts = [
  { id: '1', title: 'First Post', content: 'Hello World!', authorId: '1' },
  { id: '2', title: 'GraphQL Guide', content: 'Learn GraphQL in 5 mins', authorId: '2' },
];

// Определение GraphQL схемы с помощью SDL (Schema Definition Language)
const typeDefs = gql`
  type User {
    id: ID!                 # Уникальный идентификатор (обязательное поле)
    name: String!           # Имя пользователя
    email: String!          # Электронная почта
    posts: [Post!]!         # Список постов пользователя (не может быть null)
  }

  type Post {
    id: ID!                 # Уникальный идентификатор поста
    title: String!          # Заголовок поста
    content: String!        # Содержание поста
    author: User!           # Автор поста (связь с типом User)
  }

  type Query {
    users: [User!]!         # Запрос для получения всех пользователей
    user(id: ID!): User     # Запрос пользователя по ID (может возвращать null)
    posts: [Post!]!         # Запрос для получения всех постов
  }

  type Mutation {
    createPost(             # Мутация для создания нового поста
      title: String!
      content: String!
      authorId: ID!
    ): Post!
  }
`;

// Резолверы - функции, реализующие логику работы с данными
const resolvers = {
  Query: {
    users: () => users,     # Возвращает всех пользователей
    user: (_, { id }) => users.find(user => user.id === id), # Поиск пользователя по ID
    posts: () => posts,     # Возвращает все посты
  },
  Mutation: {
    createPost: (_, { title, content, authorId }) => {
      # Создание нового поста и добавление в массив
      const newPost = {
        id: String(posts.length + 1),
        title,
        content,
        authorId,
      };
      posts.push(newPost);
      return newPost;
    },
  },
  # Кастомные резолверы для полей типов
  Post: {
    author: post => users.find(user => user.id === post.authorId), # Поиск автора поста
  },
  User: {
    posts: user => posts.filter(post => user.posts.includes(post.id)), # Фильтрация постов пользователя
  },
};

# Инициализация Apollo Server с настройками схемы и резолверов
const server = new ApolloServer({ typeDefs, resolvers });
const app = express();

# Асинхронная функция запуска сервера
async function startServer() {
  await server.start();                     # Ожидаем инициализации Apollo Server
  server.applyMiddleware({ app });          # Интеграция Apollo с Express

  # Запуск сервера на порту 4000
  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}

startServer();

/*
Особенности реализации:

1. Единая конечная точка /graphql для всех запросов
2. Строгая типизация через схему
3. Возможность выполнять сложные запросы с объединением данных
4. Автоматическая документация API через GraphQL Introspection

Пример запроса для создания поста:
mutation {
  createPost(
    title: "New Post", 
    content: "GraphQL is awesome!", 
    authorId: "1"
  ) {
    id
    title
    author {
      name
    }
  }
}
*/
```
### 4.Запустите сервер
```bash
node server.js
```
### 5.Конечный результат
После запуска сервера перейдите в браузере по адресу:
http://localhost:4000/graphql
Откроется интерфейс GraphiQL, где можно выполнять запросы.
### 6. Запросы 
Получение пользователей с их постами:
```graphql
query GetUsersWithPosts {
  users {
    name
    email
    posts {
      title
    }
  }
}
```
Создание нового поста:
```graphql
mutation CreatePost {
  createPost(
    title: "New Post", 
    content: "GraphQL is awesome!", 
    authorId: "1"
  ) {
    id
    title
    author {
      name
    }
  }
}
```
Пример запроса получения пользователя по id:
```graphql
query {
  user(id: "1") {
    id
    name
    email
    age
  }
}
```
