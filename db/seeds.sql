INSERT INTO department (name)
VALUES
("Sales"), ("Engineering"), ("Finance"), ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES 
("Sales Lead", 100000, 1),
("Salesperson", 80000, 2),
("Lead Engineer", 150000, 3),
("Software Engineer", 120000, 4),
("Accountant", 125000, 5),
("Legal Team Lead", 250000, 6),
("Lawyer", 190000, 7);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("John", "Doe", 1, 2),
("Alice", "Doe", 2, 1),
("Jack", "Jordan", 3, null),
("Anthony", "Cruz", 4, 3),
("Sarah", "Rodriguez", 5, null),
("Derek", "Jeter", 6, 4),
("Daniel", "Jones", 7, null),
("Mike", "Brown", 8, 5);