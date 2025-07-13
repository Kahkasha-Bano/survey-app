| Feature                          | Status |
| -------------------------------- | ------ |
| Login/Signup System              | done      |
| Dashboard with Project Cards     | done      |
| Create New Survey Project Form   | done      |
| Client Name & Date Field         | done     |
| File Upload (.pdf, .dwg)         | done      |
| Progress Slider                  | ⬜      |
| View Project Details Page        | ⬜      |
| Edit Project Progress            | ⬜      |
| Real-time Sync (Socket.io)       | ⬜      |
| Filter by Client / Date          | ⬜      |
| Role-based Access (Admin/Viewer) | ⬜      |


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
