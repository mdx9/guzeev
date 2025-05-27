// controllers/usersController.js
const users = [];
let idCounter = 1;

exports.getUsers = (req, res) => {
  res.json(users);
};

exports.getUserById = (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }
  res.json(user);
};

exports.createUser = (req, res) => {
  const { name, email, age } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Необходимы name и email" });
  }
  const newUser = {
    id: idCounter++,
    name,
    email,
    age: age || null
  };
  users.push(newUser);
  res.status(201).json(newUser);
};
