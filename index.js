const express = require("express");
const app = express();
const PORT = 3000;
const { sequelize } = require("./lib/index.js");
const { employee } = require("./models/employee.model.js")
const { department } = require("./models/department.model.js");
const { role } = require("./models/role.model.js");
const { employeeDepartment } = require("./models/employeeDepartment.model.js");
const { employeeRole } = require("./models/employeeRole.model.js");

app.use(express.json());

// Endpoint to seed database
app.get('/seed_db', async (req, res) => {
  try {
    await sequelize.sync({ force: true });

    const departments = await department.bulkCreate([
      { name: 'Engineering' },
      { name: 'Marketing' },
    ]);

    const roles = await role.bulkCreate([
      { title: 'Software Engineer' },
      { title: 'Marketing Specialist' },
      { title: 'Product Manager' },
    ]);

    const employees = await employee.bulkCreate([
      { name: 'Rahul Sharma', email: 'rahul.sharma@example.com' },
      { name: 'Priya Singh', email: 'priya.singh@example.com' },
      { name: 'Ankit Verma', email: 'ankit.verma@example.com' },
    ]);

    // Associate employees with departments and roles using create method on junction models
    await employeeDepartment.create({
      employeeId: employees[0].id,
      departmentId: departments[0].id,
    });
    await employeeRole.create({
      employeeId: employees[0].id,
      roleId: roles[0].id,
    });

    await employeeDepartment.create({
      employeeId: employees[1].id,
      departmentId: departments[1].id,
    });
    await employeeRole.create({
      employeeId: employees[1].id,
      roleId: roles[1].id,
    });

    await employeeDepartment.create({
      employeeId: employees[2].id,
      departmentId: departments[0].id,
    });
    await employeeRole.create({
      employeeId: employees[2].id,
      roleId: roles[2].id,
    });

    return res.json({ message: 'Database seeded!' });
  } catch (error) {
    console.error('Error seeding database:', error.message);
    return res.status(500).json({ message: 'Error seeding database.', error: error.message });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the BD5_Assignment2" });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
