import Todo from "../models/Todo.js";

/* ================= CREATE TODO ================= */
export const createTodo = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const todo = await Todo.create({
      user: req.user.id,
      text,
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error("Create Todo Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET ALL TODOS ================= */
export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(todos);
  } catch (error) {
    console.error("Get Todos Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE TODO ================= */
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    todo.text = req.body.text ?? todo.text;
    todo.completed =
      req.body.completed !== undefined
        ? req.body.completed
        : todo.completed;

    const updated = await todo.save();

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Todo Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE TODO ================= */
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json({ message: "Todo deleted" });
  } catch (error) {
    console.error("Delete Todo Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
