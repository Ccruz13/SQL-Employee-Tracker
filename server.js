const inquirer = require("inquirer");
const mysql = require("mysql2");
const ctable = require("console.table");

const connection = mysql.createConnection({
    multipleStatements: true,
    host: "localhost",
    port: 3306,
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

// first prompt of program
const promptUser = () => {
    return inquirer.prompt([
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
            const { choices } = answers;

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
            } else if (choices === "Update Employee role") {
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
        promptUser();
    });
};

//View all roles
const viewAllRoles = () => {
    const sql = `SELECT role.id, role.title, role.salary, department.department_name AS department FROM role
                INNER JOIN department ON role.department_id = department.id`;
    connection.promise().query(sql, (err, res) => {
        if (err) throw (err);
        res.forEach((role) => {
            console.log(role.title);
        });
        promptUser();
    });
};

//View all employees
const viewAllEmployees = () => {
    const sql = `SELECT employee.id,
                 employee.first_name,
                 employee.last_name,
                 role.title,
                 role.salary,
                 department.department_name
                 FROM employee, role, department
                 WHERE department.id = role.department_id
                 AND role.id = employee.role_id
                 `;
    connection.promise().query(sql, (err, res) => {
        if (err) throw (err);
        console.table(res);
    });
};

const addDepartment = () => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'newDepartment',
            message: 'What is the name of the new department?',
            validate: newDepartmentInput => {
                if (newDepartmentInput) {
                    return true;
                } else {
                    console.log("Please enter new department name!");
                    return false;
                }
            }
        }
    ])
        .then((answer) => {
            let sql = `INSERT INTO department (department_name) VALUES (?)`;
            connection.query(sql, answer.newDepartment, (err, res) => {
                if (err) throw (err);
                console.log(answer.newDepartment + `department has been created!`);
                viewAllDepartments();
            });
        });
};

const addRole = () => {
    const sql = 'SELECT * FROM department'
    connection.promise().query(sql, (err, res) => {
        if (err) throw (err);
        let depNameArray = [];
        res.forEach((department) => { depNameArray.push(department.department_name); });
        depNameArray.push('Create Department');
        inquirer.prompt([
            {
                type: 'list',
                name: 'departmentName',
                message: 'Which department is this new role in?',
                choices: depNameArray
            }
        ])
            .then((answer) => {
                if (answer.departmentName === 'Create Department') {
                    this.addDepartment();
                } else {
                    addRoleQues(answer);
                }
            });

        const addRoleQues = (departmentData) => {
            return inquirer.prompt([
                {
                    type: 'input',
                    name: 'newRole',
                    message: 'What is the name of the new role?',
                    validate: newRoleInput => {
                        if (newRoleInput) {
                            return true;
                        } else {
                            console.log("Please enter new role name!");
                            return false;
                        }
                    }
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'What is the salary of the new role?',
                    validate: salaryInput => {
                        if (salaryInput) {
                            return true;
                        } else {
                            console.log("Please enter a salary.");
                            return false;
                        }
                    }
                }
            ])
                .then((answer) => {
                    let createdRole = answer.newRole;
                    let departmentId;

                    res.forEach(((department) => {
                        if (departmentData.departmentName === department.department_name) { departmentId = department.id };
                    }));

                    let sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                    let crit = [createdRole, answer.salary, departmentId];

                    connection.promise().query(sql, crit, (err) => {
                        if (err) throw (err);
                        console.log('Role created');
                        viewAllRoles();
                    });
                });
        };
    });
};