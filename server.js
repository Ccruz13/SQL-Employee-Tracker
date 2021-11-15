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
                "Update Employee role",
                "End"
            ]
        }
    ])
        .then((answers) => {
             choices = answers.first;

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
            } else if (choices === "Exit"){
                connection.end();
            }
        });
};

//View Departments
const viewAllDepartments = () => {
    const sql = `SELECT department.id AS id, department.department_name AS department FROM department`;
    connection.query(sql, (err, res) => {
        if (err) throw (err);
        
        console.table(res);
        promptUser();
    });
};

//View all roles
const viewAllRoles = () => {
    const sql = `SELECT role.id, role.title, role.salary, department.department_name AS department FROM role
                INNER JOIN department ON role.department_id = department.id`;
    connection.query(sql, (err, res) => {
        if (err) throw (err);
    
        console.table(res);
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
    connection.query(sql, (err, res) => {
        if (err) throw (err);
        console.table(res);
        promptUser();
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
    connection.query(sql, (err, res) => {
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

                    connection.query(sql, crit, (err) => {
                        if (err) throw (err);
                        console.log('Role created');
                        viewAllRoles();
                    });
                });
        };
    });
};

const addEmployee = () => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: "What is the employee's first name?",
            validate: firstNameInput => {
                if (firstNameInput) {
                    return true;
                } else {
                    console.log("Please enter a name.");
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: "What is the employee's last name?",
            validate: lastNameInput => {
                if (lastNameInput) {
                    return true;
                } else {
                    console.log("Please enter a name.");
                    return false;
                }
            }
        }
    ])
    .then(answer => {
        const crit = [answer.firstName, answer.lastName]
        const roleSql = `SELECT role.id, role.title FROM role`;
        connection.query(roleSql, (err, data) => {
            if (err) throw (err);
            const roles = data.map(({id, title}) => ({name: title, value: id}));
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: "What is the employee's role?",
                    choices: roles
                }
            ])
            .then(roleChoice => {
                const role = roleChoice.role;
                crit.push(role);
                const managerSql = `SELECT * FROM employee`;
                connection.query(managerSql, (err, data) => {
                    if (err) throw (err);
                    const managers = data.map(({id, first_name, last_name}) => ({name: first_name + " "+ last_name, value: id}));
                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'manager',
                            message: "Who is the employee's manager?",
                            choices: managers
                        }
                    ])
                    .then(managerChoice => {
                        const manager = managerChoice.manager;
                        crit.push(manager);
                        const sql = `INSERT INTO employee (frist_name, last_name, role_id, manager_id)
                                    VALUES (?, ?, ?, ?)`;
                        connection.query(sql, crit, (err) => {
                            if (err) throw (err);
                            console.log("Employee has been added.")
                            viewAllEmployees();
                        });
                    });
                });
            });
        });
    });
};