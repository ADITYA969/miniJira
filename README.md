Mini Jira - Team Task Management System

MERN Stack: MongoDB, Express, React, Node.js (JavaScript only)

Project Structure

mini-jira/
  backend/
    src/
      models/         User.js  Project.js  Task.js
      middleware/     auth.js  role.js  validate.js  logger.js  errorHandler.js
      controllers/    auth.controller.js  user.controller.js  admin.controller.js  project.controller.js  task.controller.js
      routes/         auth.routes.js  user.routes.js  admin.routes.js  project.routes.js  task.routes.js
      utils/          validation.js  response.js
      app.js
      server.js
    .env.example
    package.json
  frontend/
    src/
      api/            axios.js  auth.api.js  user.api.js  admin.api.js  project.api.js  task.api.js
      context/        AuthContext.js
      components/
        common/       PrivateRoute.js
        layout/       Navbar.js
      pages/          Login.js  Signup.js  Dashboard.js  Projects.js  ProjectDetail.js  MyTasks.js  Admin.js
      App.js
      index.js
      index.css
    public/           index.html
    .env.example
    package.json

Setup Instructions

1. Backend Setup

  cd backend
  cp .env.example .env

  Fill in your .env values:
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/mini-jira
    JWT_SECRET=your_secret_key_here

  npm install
  npm run dev

  Backend runs on http://localhost:5000

2. Frontend Setup

  cd frontend
  cp .env.example .env

  Default .env content (change only if backend runs on a different port or host):
    REACT_APP_API_URL=http://localhost:5000

  npm install
  npm start

  Frontend runs on http://localhost:3000

Note: In local development the proxy in frontend/package.json handles API routing
automatically. REACT_APP_API_URL is used when frontend and backend are deployed
to different servers.

API Endpoints

Auth
  POST   /api/auth/signup
  POST   /api/auth/login

User
  GET    /api/users/profile
  PUT    /api/users/profile

Admin (admin only)
  GET    /api/admin/users
  GET    /api/admin/users/pending
  PATCH  /api/admin/users/:id/approve
  PATCH  /api/admin/users/:id/role
  DELETE /api/admin/users/:id

Projects
  GET    /api/projects
  GET    /api/projects/:id
  POST   /api/projects                       (admin only)
  POST   /api/projects/:id/members           (admin only)
  DELETE /api/projects/:id/members/:userId   (admin only)
  DELETE /api/projects/:id                   (admin only)

Tasks
  GET    /api/tasks                          (admin only)
  GET    /api/tasks/my
  GET    /api/tasks/project/:projectId
  POST   /api/tasks
  PATCH  /api/tasks/:id/status
  PATCH  /api/tasks/:id/assign               (admin only)
  PUT    /api/tasks/:id
  DELETE /api/tasks/:id                      (admin only)

Middleware Chain (per request)
  Logger -> Auth -> Role -> Validation -> Route Handler -> Error Handler

User Flow
  1. Signup (status: pending)
  2. Admin approves user (status: active)
  3. Login (only active users can log in)
  4. JWT token is used for all protected routes

Task Status Flow
  todo -> in-progress -> done (members can only move forward, admin can set any)

RBAC Summary
  Action             Allowed Role
  Approve user       Admin
  Create project     Admin
  Add member         Admin
  Remove member      Admin
  Assign task        Admin
  Create task        Admin or Member
  Update own task    Assigned Member or Admin
  Delete task        Admin
  Delete user        Admin
