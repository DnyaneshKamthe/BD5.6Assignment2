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

// Helper function to get employee's associated departments
async function getEmployeeDepartments(employeeId) {
    const employeeDepartments = await employeeDepartment.findAll({
      where: { employeeId },
    });
  
    let departmentData;
    for (let empDep of employeeDepartments) {
      departmentData = await department.findOne({
        where: { id: empDep.departmentId },
      });
    }
  
    return departmentData;
}

//helper function to get employee's associated roles
async function getEmployeeRoles(employeeId) {
    const employeeRoles = await employeeRole.findAll({
        where: { employeeId },
      });
    
      let roleData;
      for (let empRol of employeeRoles) {
        roleData = await role.findOne({
          where: { id: empRol.roleId },
        });
      }
      return roleData;
}
  
// Helper function to get employee details with associated departments and roles
async function getEmployeeDetails(employeeData) {
    const department = await getEmployeeDepartments(employeeData.id);
    const role = await getEmployeeRoles(employeeData.id);
    
    return {
      ...employeeData.dataValues,
      department,
      role,
    };
}

//Helper function to sort employees by name
async function sortEmployeesByName(employeeData, order) {
    try {  
     // Sort the employeeData array by the 'name' property in the specified order
        const sortedEmployees = employeeData.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
  
        if (nameA < nameB) return order === 'asc' ? -1 : 1;
        if (nameA > nameB) return order === 'asc' ? 1 : -1;
        return 0; // If names are equal, return 0
      });
      return sortedEmployees;
    } catch (error) {
      return error.message;
    }
  }
  


//endpoints

app.get("/employees", async (req, res) => {
    try {
        let result = await employee.findAll();
        if(result.length === 0 ) {
            return res.status(404).json({ message : 'No employee found'})
        }
        let employees = [];
        for( let i = 0 ; i < result.length ; i++) {
            let employeeData = await getEmployeeDetails(result[i]);
            employees.push(employeeData)
        }
        res.status(200).json({employees : employees})
    } catch (error) {
        return res.status(500).json({ message : error.message })
    }
})

app.get("/employees/details/:id", async(req, res) => {
    try {
        let employeeId = req.params.id;
        let employeeData = await employee.findOne({where : {id : employeeId}}) ;
        if(employeeData === null){
            return res.status(404).json({message : 'Employee Not found with this id'})
        }
        let result = await getEmployeeDetails(employeeData);
        return res.status(200).json({employee : result})
    } catch (error) {
        return res.status(500).json({message : error.message})
    }
})

app.get("/employees/department/:departmentId", async(req, res) => {
    try {
        let departmentId = req.params.departmentId;
        let employeeDepartmentData = await employeeDepartment.findAll({where : {departmentId : departmentId }});
        if(employeeDepartmentData.length === 0) {
            return res.status(400).json({message : 'Not found any record for this department id'})
        }
        let allEmployees = []
        for(let i = 0 ; i< employeeDepartmentData.length ; i++) {
            let employeeData  = await employee.findOne({where : {id : employeeDepartmentData[i].employeeId}})
            let result = await getEmployeeDetails(employeeData);
            allEmployees.push(result)
        }
        return res.status(200).json({employees : allEmployees})
    } catch (error) {
        return res.status(500).json({message : error.message})
    }
})

app.get("/employees/role/:roleId", async (req, res) => {
    try {
        let roleId = req.params.roleId;
        let allEmployees = []
        let employeeRoleData = await employeeRole.findAll({where : { roleId : roleId }});
        if(employeeRoleData.length === 0){
            return res.status(400).json({message : "No record forund for this role id"})
        }
        for(let i = 0 ; i < employeeRoleData.length ; i++){
            let employeeData = await employee.findOne({where : {id : employeeRoleData[i].employeeId}})
            let result = await getEmployeeDetails(employeeData);
            allEmployees.push(result)
        }
        return res.status(200).json({employess : allEmployees})
    } catch (error) {
        return res.status(500).json({message : error.message})
    }
})

app.get("/employees/sort-by-name", async(req, res) => {
    try {
        let order = req.query.order;
        let employeeData = await employee.findAll();
        if(employeeData.length === 0){
            return res.status(400).json({message : "No employee found"})
        }
        let allEmployees = []
        for(let i = 0 ; i< employeeData.length ; i++) {
            let result = await getEmployeeDetails(employeeData[i]);
            allEmployees.push(result)
        }
        let sortedEmployeeData = await sortEmployeesByName(allEmployees, order)
        return res.status(200).json({ employees : sortedEmployeeData })
    } catch (error) {
        return res.status(500).json({message : error.message})
    }
})

app.post("employees/new", async(req, res)=>{
  try {
    let { name, email , departmentId, roleId } = req.body;
    // Validate input data
    if (!name || !email || !departmentId || !roleId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create new employee record
    const newEmployee = await employee.create({ name, email });

    // create mapping with department
    await employeeDepartment.create({
      employeeId: newEmployee.id,
      departmentId
    });

    //create mapping with role
    await employeeRole.create({
      employeeId : newEmployee.id,
      roleId : roleId
    })

    const createdEmployee = await getEmployeeDetails(newEmployee.id);
    return res.status(200).json({employee : createdEmployee})

  } catch (error) {
    res.status(500).json({message : error.message})
  }
})



app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the BD5_Assignment2" });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
