interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}

interface IEmployeeOrgApp {
  ceo: Employee;

  /**
   * Moves the employee with employeeID (uniqueId) under a supervisor
   (another employee) that has supervisorID (uniqueId).
   * E.g. move Bob (employeeID) to be subordinate of Georgina
   (supervisorID). * @param employeeID
   * @param supervisorID
   */
  move(employeeID: number, supervisorID: number): void;

  /** Undo last move action */
  undo(): void;

  /** Redo last undone action */
  redo(): void;
}

type IUndoStack = [Employee, Employee, Employee, number, number];

/*
* Mark Zuckerberg:
  - Sarah Donald:
    - Cassandra Reynolds:
      - Mary Blue:
      - Bob Saget:--------------
        - Tina Teff:
          - Will Turner:

  - Tyler Simpson:
    - Harry Tobs:
      - Thomas Brown:
    - George Carrey:
    - Gary Styles:

  - Bruce Willis:
  - Georgina Flangy:+++++++++
    - Sophie Turner:

* */
const ceoObj: Employee = {
  uniqueId: 1,
  name: "Mark Zuckerberg",
  subordinates: [
    {
      uniqueId: 2,
      name: "Sarah Donald",
      subordinates: [{
        uniqueId: 6,
        name: "Cassandra Reynolds",
        subordinates: [
          {
            uniqueId: 11,
            name: "Mary Blue",
            subordinates: []
          },
          {
            uniqueId: 12,
            name: "Bob Saget",
            subordinates: [{
              uniqueId: 14,
              name: "Tina Teff",
              subordinates: [{
                uniqueId: 15,
                name: "Will Turner",
                subordinates: []
              }]
            }]
          }
        ]
      }
      ]
    },
    {
      uniqueId: 3,
      name: "Tyler Simpson",
      subordinates: [
        {
          uniqueId: 7,
          name: "Harry Tobs",
          subordinates: [{
            uniqueId: 13,
            name: "Thomas Brown",
            subordinates: []
          }]
        },
        {
          uniqueId: 8,
          name: "George Carrey",
          subordinates: []
        },
        {
          uniqueId: 9,
          name: "Gary Styles",
          subordinates: []
        }
      ]
    },
    {
      uniqueId: 4,
      name: "Bruce Willis",
      subordinates: []
    },
    {
      uniqueId: 5,
      name: "Georgina Flangy",
      subordinates: [{
        uniqueId: 10,
        name: "Sophie Turner",
        subordinates: []
      }]
    }
  ]
};

class EmployeeOrgApp implements IEmployeeOrgApp {
  ceo: Employee;
  undoStack:IUndoStack[];
  redoStack:any;

  constructor (ceo: Employee) {
    this.ceo = ceo;
    this.undoStack = [];
    this.redoStack = [];
  }

  move (employeeID: number, supervisorID: number) {
    const employee = this.findEmployee(employeeID, this.ceo); // Bob
    const newSupervisor = this.findEmployee(supervisorID, this.ceo); // Georgina
    const currentSupervisor = this.findEmployeeParent(employeeID, this.ceo); // Bob's supervisor Cassandra
    if (!employee || !newSupervisor || !currentSupervisor) {
      console.log("Employee or supervisor not found");
      return;
    }

    const employeeParentIndex = currentSupervisor.subordinates.indexOf(employee); // Bob's index in Cassandra's subordinates
    currentSupervisor.subordinates.splice(employeeParentIndex, 1); // remove Bob from Cassandra's subordinates
    currentSupervisor.subordinates.push(...employee.subordinates); // push Bob's subordinates to Cassandra
    newSupervisor.subordinates.push({ ...employee, subordinates: [] }); // push Bob to Georgina without subordinates

    this.undoStack.push([currentSupervisor, newSupervisor, employee, employeeID, supervisorID]);
    this.redoStack = [];
  }

  private findEmployeeParent (employeeID: number, employee: Employee): Employee {
    for (let i = 0; i < employee.subordinates.length; i++) {
      if (employee.subordinates[i].uniqueId === employeeID) {
        return employee;
      }
      const foundEmployee = this.findEmployeeParent(employeeID, employee.subordinates[i]);
      if (foundEmployee) {
        return foundEmployee;
      }
    }
    // @ts-ignore
    return null;
  }

  private findEmployee (employeeID: number, employee: Employee): Employee {
    if (employee.uniqueId === employeeID) {
      return employee;
    }
    for (let i = 0; i < employee.subordinates.length; i++) {
      const foundEmployee = this.findEmployee(employeeID, employee.subordinates[i]);
      if (foundEmployee) {
        return foundEmployee;
      }
    }
    // @ts-ignore
    return null;
  }

  undo () {
    if (this.undoStack.length) {
      const [previousSupervisor, currentSupervisor, previousEmployeeState, employeeID, supervisorID] = this.undoStack.pop() as IUndoStack;

      // remove subordinates from previousSupervisor those are added during move
      previousEmployeeState.subordinates.forEach(() => {
        previousSupervisor.subordinates.pop();
      });
      previousSupervisor.subordinates.push(previousEmployeeState);

      // remove employee from currentSupervisor
      currentSupervisor.subordinates.pop();
      this.redoStack.push([employeeID, supervisorID]);
    } else {
      console.log("Nothing to undo");
    }
  }

  redo () {
    if (this.redoStack.length) {
      this.move(...this.redoStack.pop() as [number, number]);
    } else {
      console.log("Nothing to redo");
    }
  }
}

const empApp = new EmployeeOrgApp(ceoObj);
//
// window.empApp = empApp;
// debugger;
// console.log(empApp.ceo.subordinates[0].subordinates[0].subordinates[1].name === "Bob Saget");
//
// empApp.move(12, 5);
// console.log(empApp.ceo.subordinates[0].subordinates[0].subordinates[1].name === "Tina Teff");
// console.log(empApp.ceo.subordinates[3].subordinates[1].name === "Bob Saget");
//
// empApp.undo();
// console.log(empApp.ceo.subordinates[0].subordinates[0].subordinates[1].name === "Bob Saget");
//
// empApp.redo();
// console.log(empApp.ceo.subordinates[0].subordinates[0].subordinates[1].name === "Tina Teff");
// console.log(empApp.ceo.subordinates[3].subordinates[1].name === "Bob Saget");
