const { DataTypes, sequelize } = require("../lib/index.js");
const { employee } = require("./employee.model.js")
const { role } = require("./role.model.js")

const employeeRole = sequelize.define("employeeRole",{
    employeeId : {
        type : DataTypes.INTEGER,
        allowNull : false,
        references : {
          model : 'employee',
          key : 'id',
        }
    },
    roleId : {
        type : DataTypes.INTEGER,
        allowNull : false,
        references : {
          model : 'role',
          key : 'id',
        }
    }
})

employee.belongsToMany(role, { through : employeeRole })
role.belongsToMany(employee, { through : employeeRole })

module.exports = { employeeRole }