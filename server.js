const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/habit-tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Habit Schema
const habitSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    lastCompletedDate: { type: Date },
    streak: { type: Number, default: 0 },
    completionHistory: [{ type: String }],
    calendarEventId: { type: String }
});

const Habit = mongoose.model('Habit', habitSchema);

// Routes
app.get('/api/habits/:userId', async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.params.userId });
        res.json(habits);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/habits', async (req, res) => {
    try {
        const habit = new Habit(req.body);
        await habit.save();
        res.status(201).json(habit);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/habits/:id', async (req, res) => {
    try {
        const habit = await Habit.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(habit);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/habits/:id', async (req, res) => {
    try {
        await Habit.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});