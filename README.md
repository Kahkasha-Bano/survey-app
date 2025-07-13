| Feature                          | Status |
| -------------------------------- | ------ |
| Login/Signup System              | done      |
| Dashboard with Project Cards     | done      |
| Create New Survey Project Form   | done      |
| Client Name & Date Field         | done     |
| File Upload (.pdf, .dwg)         | done      |
| Progress Slider                  | done    |
| View Project Details Page        | done     |
| Edit Project Progress            | done     |
| Real-time Sync (Socket.io)       | ⬜      |
| Filter by Client / Date          | done     |
| Role-based Access (Admin/Viewer) | done      |


## Use Case:
ProbuidTech team does land surveys, and they:

Collect data for each project site (zameen ka survey)

Save project date, client name

Upload .DWG (AutoCAD drawings) and .PDF

Track progress — likely of drafting or physical survey

Need real-time access for this information



## Project Entry Form (New Survey Form)
Fields:

Project Name

Client Name

Survey Date

Project Location

File Upload: Allow .dwg and .pdf files

Progress Slider: Let’s use 0% to 100% scale

Optional: Notes / comments




## Progress Slider Design
Since progress refers to “kitna kaam hua drafting ya survey ka,” you can define:

0% = Survey not started

25% = Survey completed

50% = Drafting started

75% = Drafting done, review pending

100% = Final drawings uploaded and project closed


# project Details
## Authentication & Authorization (Role-Based Access)
Admin: full control (create, edit, delete, upload)

Field Staff: sirf survey upload/update kar sake

Viewer: only dekhe, edit na kar sake
✅ JWT + Role middleware se implement karo (Express.js backend)

## Project Status Filter & Search
Filter projects by:

Client Name

Survey Date Range

Progress (0–100%)

Drafting done / Survey pending

Real world mai 100s of projects ho sakte hain — searching zaruri hai

## Backup & Versioning of Files
Har nayi DWG ya PDF upload hone par:

Pichla version bhi store ho (version history)

"Last uploaded on" + file uploader ka naam show ho

Yeh clients aur auditors ke liye useful hoga

 ## Notifications (Email / In-App)
Jab kisi project ka progress 100% ho jaye → bhai ko email mile

Naye project create ho → admin ko notification

Backend se NodeMailer ya frontend mai popup toast alerts

## Project Timeline View
Ek vertical timeline jisme dikhaye:

Survey started → Survey completed → Drafting started → Drafting completed

UI mai clarity aayegi client ya team ke liye

## GPS Location Capture
Jab field staff survey data submit kare:

Us waqt ka GPS location auto save ho (navigator.geolocation in React)

Map pr pinpoint bhi dikha sakte ho (Google Maps API se)

 ## Analytics Dashboard
Total projects: X

Drafting complete: Y

Survey completed: Z

Graphs: Pie chart, Bar chart using Chart.js or Recharts

Manager-level view ke liye helpful

## Offline Mode for Field Users
Internet nahi ho to:

Form localStorage/IndexedDB me save ho jaye

Internet wapas aaye to sync ho jaye

Ye feature field surveyors ke liye real-life saver hai

## Generate Auto PDF Report
Ek button se auto-generate:

Project details

Client name

Attached files

Progress bar

PDF ko client ke saath share karne ke liye use karo

## Feedback / Issue Reporting System
Agar staff ko koi issue aaye (file upload issue, GPS error, etc.)

Ek "Report Issue" button ho

Admin usko review kar sake

## Bonus: UI/UX Polish
TailwindCSS + Responsive layout

Skeleton loaders during fetch

Toast notifications for success/error

Dark mode toggle

## Payment Tracking (Embedded in Project)
Each project in the system includes an embedded array of payment records, allowing tight coupling between survey work and its financial transactions. This enables:

Easy tracking of total amount, received payments, and dues

Support for multiple payments per project with fields like amount, mode, date, notes, and invoice file link

Auto-updated fields: amountReceived, paymentStatus, and lastPaymentDate

Clean API for adding payments directly into the project document (no separate collection needed)

Ideal for real-world use where project and payment data are managed together



| Variable                     | Purpose                                  | Example                     |
| ---------------------------- | ---------------------------------------- | --------------------------- |
| `PORT`                       | Server kis port pe chalega               | `3000`, `5000`              |
| `MONGO_URI` / `DATABASE_URL` | MongoDB / PostgreSQL ka URI              | `mongodb+srv://...`         |
| `JWT_SECRET`                 | JWT tokens sign/verify karne ke liye key | Long random string          |
| `JWT_EXPIRATION`             | JWT token kitni der tak valid rahe       | `1h`, `7d`                  |
| `NODE_ENV`                   | Project environment                      | `development`, `production` |
| `CORS_ORIGIN`                | Kis frontend domain ko allow kare        | `http://localhost:3000`     |
| `CLOUDINARY_URL`             | File upload ke liye (images/PDF)         | Cloudinary config           |
| `EMAIL_USER`                 | SMTP email service user                  | Gmail/email provider        |
| `EMAIL_PASS`                 | SMTP email password / app password       | Secret                      |
| `FRONTEND_URL`               | React app ka base URL                    | `http://localhost:3000`     |
| `BASE_API_URL`               | API base path                            | `http://localhost:5000/api` |
