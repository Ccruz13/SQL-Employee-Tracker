const inquirer = require("inquirer");
const mysql = require("mysql2");
const console = require("console.table");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3001,
    user: "root",
    password: "",
    database: "employee_tracker"
});

//check if sql server connects
connection.connect(function (err) {
    if (err) throw (err);
    // run prompt if connects
    promptUser();
});

const promptUser = () => {
    return inquirer.prompt ([
        {
            type: "list",
            name: "first",
            message: "What would you like to do?",
            choices: [
                "View All Departments",
                "View All roles",
                "View All Employees",
                "Add a department",
                "Add a Role",
                "Add an Employee",
                "Update Employee role"
            ]
        }
    ])
    .then((answers) => {
        const {choices} = answers;

        if (choices === "View All Departments") {
            return viewAllDepartments();
        } else if (choices === "View All roles") {
            return viewAllRoles();
        } else if (choices === "View All Employees") {
            return viewAllEmployees();
        } else if (choices === "Add a department") {
            return addDepartment();
        } else if (choices === "Add a Role") {
            return addRole();
        } else if (choices === "Add an Employee") {
            return addEmployee();
        } else (choices === "Update Employee role") {
            return updateEmployeeRole();
        }
    });
};

//View Departments
const viewAllDepartments = () => {
    const sql = `SELECT department.id AS id, department.department_name AS department FROM department`;
    connection.promise().query(sql, (err, res) => {
        if (err) throw (err);
        console.table(res);
        promptUser;
    });
};