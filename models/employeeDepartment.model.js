const { DataTypes, sequelize } = require("../lib/index.js");

const employeeDepartment = sequelize.define("employeeDepartment",{
    employeeId : {
        type : DataTypes.INTEGER,
        allowNull : false,
        references : {
          model : 'employee',
          key : 'id',
        }
    },
    departmentId : {
        type : DataTypes.INTEGER,
        allowNull : false,
        references : {
          model : 'department',
          key : 'id',
        }
    }
})

employee.belongsToMany(department, { through : employeeDepartment })
department.belongsToMany(employee, { through : employeeDepartment })

module.exports = { employeeDepartment }