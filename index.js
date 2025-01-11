const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// GET all patients
app.get('/patients', async (req, res) => {
  try {
      const patients = await prisma.patient.findMany();
      res.json(patients);
  } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).send("Error fetching patients.");
  }
});

// POST a new patient
app.post('/patients', async (req, res) => {
  try {
    const { name, age, gender, roomNumber, bedNumber, floorNumber, contactInfo, emergencyContact, allergies, diseases } = req.body;

    // Validate required fields
    if (!name || !age || !gender || !roomNumber || !bedNumber || !floorNumber || !contactInfo || !emergencyContact || !allergies || !diseases) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Log the incoming request body
    console.log("Received data:", req.body);

    const newPatient = await prisma.patient.create({
      data: {
        name,
        age: parseInt(age, 10), // Convert age to an integer
        gender,
        roomNumber,
        bedNumber,
        floorNumber,
        contactInfo,
        emergencyContact,
        allergies,
        diseases,
      }
    });

    res.json(newPatient);
  } catch (error) {
    console.error("Error creating patient:", error); // Detailed error logging
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update a patient
app.put('/patients/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updatedPatient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(updatedPatient);
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({ error: "Failed to update patient" });
  }
});

// DELETE a patient
app.delete('/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // First delete the associated diet charts
    await prisma.dietChart.deleteMany({
      where: {
        patientId: parseInt(id),  // Delete diet charts for the patient
      },
    });

    // Then delete the patient
    await prisma.patient.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// GET all diet charts
app.get('/diet-charts', async (req, res) => {
  try {
    const dietCharts = await prisma.dietChart.findMany();
    res.json(dietCharts);
  } catch (error) {
    console.error("Error fetching diet charts:", error);
    res.status(500).send("Error fetching diet charts.");
  }
});

// POST a new diet chart
app.post('/diet-charts', async (req, res) => {
  const { patientId, mealType, instructions, ingredients } = req.body;
  try {
    const newDietChart = await prisma.dietChart.create({
      data: {
        patientId,
        mealType,
        instructions,
        ingredients,
      },
    });
    res.json(newDietChart);
  } catch (error) {
    console.error("Error creating diet chart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update a diet chart
app.put('/diet-charts/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updatedDietChart = await prisma.dietChart.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(updatedDietChart);
  } catch (error) {
    console.error("Error updating diet chart:", error);
    res.status(500).json({ error: "Failed to update diet chart" });
  }
});

// DELETE a diet chart
app.delete('/diet-charts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.dietChart.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Diet chart deleted successfully' });
  } catch (error) {
    console.error("Error deleting diet chart:", error);
    res.status(500).json({ error: "Failed to delete diet chart" });
  }
});

// GET all staff members
app.get('/staff', async (req, res) => {
  try {
    const staff = await prisma.staff.findMany();
    res.json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).send("Error fetching staff.");
  }
});

// POST a new staff member
app.post('/staff', async (req, res) => {
  const { name, role, contactInfo } = req.body;
  try {
    const newStaff = await prisma.staff.create({
      data: {
        name,
        role,
        contactInfo,
      },
    });
    res.json(newStaff);
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany();
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("Error fetching tasks.");
  }
});

// POST a new task
app.post('/tasks', async (req, res) => {
  const { description, staffId, completed } = req.body;
  try {
    const newTask = await prisma.task.create({
      data: {
        description,
        staffId,
        completed,
      },
    });
    res.json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update a task (mark as completed)
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        completed,
      },
    });
    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// GET all deliveries
app.get('/deliveries', async (req, res) => {
  try {
    const deliveries = await prisma.delivery.findMany();
    res.json(deliveries);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).send("Error fetching deliveries.");
  }
});

// POST a new delivery
app.post('/deliveries', async (req, res) => {
  const { mealBoxDetails, deliveryStatus } = req.body;
  try {
    const newDelivery = await prisma.delivery.create({
      data: {
        mealBoxDetails,
        deliveryStatus,
      },
    });
    res.json(newDelivery);
  } catch (error) {
    console.error("Error creating delivery:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
