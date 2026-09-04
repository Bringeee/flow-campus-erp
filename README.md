# Build a simple but fully functional College ERP MVP called VTOP

Build a **simple but fully functional College ERP MVP** called **VTOP**.

The goal is to solve the problem of colleges managing student records, attendance, fees and results in separate Excel sheets.

### Tech

Use React + TypeScript + Tailwind CSS + shadcn/ui. Use a simple database/backend if available. Avoid unnecessary libraries and complex features.

### Main Features

Create 3 demo roles:

**Admin**

* View dashboard

* Add/edit/delete students

* Manage attendance, fees and results

* Export reports

**Faculty**

* View students

* Mark attendance

* Enter marks/results

**Student**

* View own profile

* View attendance

* View fees

* View results

### Pages

1. **Login**

   * Email/password

   * Demo login buttons for Admin, Faculty and Student

2. **Admin Dashboard**

   Show 4 cards:

   * Total Students

   * Average Attendance

   * Pending Fees

   * Pass Percentage

   Add 2 simple charts:

   * Attendance overview

   * Result/grade distribution

3. **Students**

   * Student table

   * Search

   * Add/Edit/Delete student

   * Student details: ID, name, department, course, semester, attendance, fees and result

4. **Attendance**

   * Student list

   * Present/Absent

   * Automatically calculate attendance %

   * Highlight attendance below 75%

5. **Fees**

   * Total fee

   * Paid

   * Remaining

   * Status: Paid/Pending

6. **Results**

   * Subject

   * Marks

   * Grade

   * Percentage

   * Pass/Fail

   * Automatically calculate grade

7. **Reports**

   * Export Student, Attendance, Fees and Results data to Excel

   * Add a simple PDF report option if easy to implement

### Mock Data

Generate realistic fake Indian college data:

* 50 students

* 5 faculty

* 4 departments

* Multiple semesters

* Attendance, fees and marks

No external APIs or real student data.

### UI

Make it look like a professional modern college ERP:

* Clean dashboard

* Sidebar navigation

* Responsive design

* Tables

* Cards

* Charts

* Search

* Status badges

* Toast notifications

Use the name:

**VTOP**

Tagline:

**VIT On Top. Complete Control.**

### IMPORTANT

This is an **MVP for a hackathon**, so keep the project small and focused.

Do NOT add unnecessary features such as payment gateways, complex notifications, document management, advanced audit systems, complex settings or external APIs.

Prioritize:

**working login → role-based dashboards → student management → attendance → fees → results → reports.**

Make the core features functional rather than creating many incomplete pages.

Avoid over-engineering and minimize dependencies so the project can be generated within a very small number of iterations/credits.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/405b1cf4-1189-4a2c-ad8e-39067300941d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
