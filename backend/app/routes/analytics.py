from fastapi import APIRouter, Depends

from app.database import get_db
from app.models.schemas import AnalyticsResponse, ResourceResponse
from app.utils.deps import get_optional_user_id
from app.utils.helpers import serialize_resource

router = APIRouter(prefix="/analytics", tags=["analytics"])

SYLLABUS = {
    "CSE": {
        "1": [
            "Mathematics-I",
            "Basic Economics",
            "Programming with Python",
            "Programming with Python Lab",
            "Problem Solving using C",
            "Problem Solving using C Lab",
            "Communication Skills Lab",
            "Universal Human Values"
        ],

        "2": [
            "Discrete Mathematics",
            "Data Structures",
            "Data Structures Lab",
            "Logic System Design",
            "Logic System Design Lab",
            "Basic Electrical and Electronics Engineering",
            "Electrical Engineering Lab",
            "Electronics Engineering Lab"
        ],

        "3": [
            "Object Oriented Programming",
            "Object Oriented Programming Lab",
            "Computer Organization",
            "Computer Organization Lab",
            "Design and Analysis of Algorithms",
            "Probability and Statistics",
            "Open Elective-I"
        ],

        "4": [
            "Database Management Systems",
            "Database Management Systems Lab",
            "Operating Systems",
            "Operating Systems Lab",
            "Theory of Computation",
            "Software Engineering",
            "Open Elective-II"
        ],

        "5": [
            "Computer Networks",
            "Computer Networks Lab",
            "Compiler Design",
            "Compiler Design Lab",
            "Artificial Intelligence",
            "Department Elective-I",
            "Open Elective-III"
        ],

        "6": [
            "Machine Learning",
            "Machine Learning Lab",
            "Information Security",
            "Department Elective-II",
            "Department Elective-III",
            "Mini Project",
            "Open Elective-IV"
        ],

        "7": [
            "Department Elective-IV",
            "Department Elective-V",
            "Industrial Internship / Project Phase-I",
            "Honours / Minor Elective-I",
            "Honours / Minor Elective-II"
        ],

        "8": [
            "B.Tech Project Phase-II",
            "Department Elective-VI",
            "Honours / Minor Elective-III",
            "Honours / Minor Elective-IV"
        ]
},
    "ECE": {
    "1": [
        "Mathematics-I",
        "Basic Economics",
        "Programming with Python",
        "Programming with Python Lab",
        "Basic Electrical and Electronics Engineering",
        "Electrical Engineering Lab",
        "Communication Skills Lab",
        "Universal Human Values"
    ],

    "2": [
        "Electronic Measurement and Instrumentation",
        "Electronics Engineering Lab",
        "Signals and Systems",
        "Network Analysis",
        "Engineering Mathematics-II",
        "Digital Electronics",
        "Environmental Science"
    ],

    "3": [
        "Electronic Devices and Circuits",
        "Electronic Devices and Circuits Lab",
        "Analog Electronic Circuits",
        "Analog Electronic Circuits Lab",
        "Electromagnetic Theory",
        "Probability and Random Processes",
        "Open Elective-I"
    ],

    "4": [
        "Digital Signal Processing",
        "Digital Signal Processing Lab",
        "Microprocessors and Microcontrollers",
        "Microprocessors and Microcontrollers Lab",
        "Control Systems",
        "Communication Engineering",
        "Open Elective-II"
    ],

    "5": [
        "Analog Communication",
        "Digital Communication",
        "Digital Communication Lab",
        "VLSI Design",
        "VLSI Design Lab",
        "Department Elective-I",
        "Open Elective-III"
    ],

    "6": [
        "Wireless Communication",
        "Embedded Systems",
        "Embedded Systems Lab",
        "Department Elective-II",
        "Department Elective-III",
        "Mini Project",
        "Open Elective-IV"
    ],

    "7": [
        "Department Elective-IV",
        "Department Elective-V",
        "Industrial Internship / Project Phase-I",
        "Honours / Minor Elective-I",
        "Honours / Minor Elective-II"
    ],

    "8": [
        "B.Tech Project Phase-II",
        "Department Elective-VI",
        "Honours / Minor Elective-III",
        "Honours / Minor Elective-IV"
    ]
},
    "EE": {
    "1": [
        "Mathematics-I",
        "Basic Economics",
        "Programming with Python",
        "Programming with Python Lab",
        "Basic Electrical and Electronics Engineering",
        "Electrical Engineering Lab",
        "Communication Skills Lab",
        "Universal Human Values"
    ],

    "2": [
        "Engineering Mathematics-II",
        "Network Theory",
        "Electrical Machines-I",
        "Electrical Machines-I Lab",
        "Analog Electronics",
        "Analog Electronics Lab",
        "Environmental Science"
    ],

    "3": [
        "Signals and Systems",
        "Power Systems-I",
        "Power Systems-I Lab",
        "Control Systems",
        "Electrical Measurements and Instrumentation",
        "Probability and Statistics",
        "Open Elective-I"
    ],

    "4": [
        "Power Electronics",
        "Power Electronics Lab",
        "Electrical Machines-II",
        "Electrical Machines-II Lab",
        "Microprocessors and Microcontrollers",
        "Open Elective-II"
    ],

    "5": [
        "Power System Analysis",
        "Power System Analysis Lab",
        "Digital Signal Processing",
        "Digital Signal Processing Lab",
        "Department Elective-I",
        "Open Elective-III"
    ],

    "6": [
        "Renewable Energy Systems",
        "High Voltage Engineering",
        "Department Elective-II",
        "Department Elective-III",
        "Mini Project",
        "Open Elective-IV"
    ],

    "7": [
        "Department Elective-IV",
        "Department Elective-V",
        "Industrial Internship / Project Phase-I",
        "Honours / Minor Elective-I",
        "Honours / Minor Elective-II"
    ],

    "8": [
        "B.Tech Project Phase-II",
        "Department Elective-VI",
        "Honours / Minor Elective-III",
        "Honours / Minor Elective-IV"
    ]
},
    "ME": {
    "1": [
        "Mathematics-I",
        "Basic Economics",
        "Programming with Python",
        "Programming with Python Lab",
        "Introduction to Mechanical Systems",
        "Communication Skills Lab",
        "Universal Human Values"
    ],

    "2": [
        "Applied Probability and Statistics",
        "Engineering Mechanics",
        "Engineering Graphics",
        "Workshop Practice",
        "Environmental Science",
        "Basic Electrical and Electronics Engineering"
    ],

    "3": [
        "Thermodynamics",
        "Strength of Materials",
        "Manufacturing Processes",
        "Fluid Mechanics",
        "Material Science",
        "Open Elective-I"
    ],

    "4": [
        "Heat Transfer",
        "Machine Design-I",
        "Kinematics of Machines",
        "Measurement and Metrology",
        "CAD/CAM",
        "Open Elective-II"
    ],

    "5": [
        "Dynamics of Machines",
        "IC Engines",
        "Industrial Engineering",
        "Finite Element Methods",
        "Department Elective-I",
        "Open Elective-III"
    ],

    "6": [
        "Refrigeration and Air Conditioning",
        "Mechanical Vibrations",
        "Department Elective-II",
        "Department Elective-III",
        "Mini Project",
        "Open Elective-IV"
    ],

    "7": [
        "Department Elective-IV",
        "Department Elective-V",
        "Industrial Internship / Project Phase-I",
        "Honours / Minor Elective-I",
        "Honours / Minor Elective-II"
    ],

    "8": [
        "B.Tech Project Phase-II",
        "Department Elective-VI",
        "Honours / Minor Elective-III",
        "Honours / Minor Elective-IV"
    ]
},
   "CE": {
    "1": [
        "Mathematics-I",
        "Basic Economics",
        "Programming with Python",
        "Programming with Python Lab",
        "Introduction to Civil Engineering",
        "Communication Skills Lab",
        "Universal Human Values"
    ],

    "2": [
        "Engineering Mechanics",
        "Engineering Geology",
        "Surveying",
        "Building Materials",
        "Environmental Science",
        "Basic Electrical and Electronics Engineering"
    ],

    "3": [
        "Strength of Materials",
        "Fluid Mechanics",
        "Structural Analysis-I",
        "Concrete Technology",
        "Transportation Engineering-I",
        "Open Elective-I"
    ],

    "4": [
        "Geotechnical Engineering-I",
        "Hydrology and Water Resources Engineering",
        "Structural Analysis-II",
        "Environmental Engineering-I",
        "Transportation Engineering-II",
        "Open Elective-II"
    ],

    "5": [
        "Design of Reinforced Concrete Structures",
        "Steel Structures-I",
        "Geotechnical Engineering-II",
        "Environmental Engineering-II",
        "Department Elective-I",
        "Open Elective-III"
    ],

    "6": [
        "Design of Steel Structures",
        "Construction Planning and Management",
        "Department Elective-II",
        "Department Elective-III",
        "Mini Project",
        "Open Elective-IV"
    ],

    "7": [
        "Department Elective-IV",
        "Department Elective-V",
        "Industrial Internship / Project Phase-I",
        "Honours / Minor Elective-I",
        "Honours / Minor Elective-II"
    ],

    "8": [
        "B.Tech Project Phase-II",
        "Department Elective-VI",
        "Honours / Minor Elective-III",
        "Honours / Minor Elective-IV"
    ]
},
   "CHE": {
    "1": [
        "Mathematics-I",
        "Basic Economics",
        "Programming with Python",
        "Programming with Python Lab",
        "Communication Skills Lab",
        "Universal Human Values"
    ],

    "2": [
        "Engineering Chemistry",
        "Chemical Process Calculations",
        "Basic Electrical and Electronics Engineering",
        "Environmental Science",
        "Engineering Thermodynamics",
        "Chemical Engineering Drawing"
    ],

    "3": [
        "Fluid Mechanics",
        "Mechanical Operations",
        "Heat Transfer",
        "Chemical Engineering Thermodynamics",
        "Numerical Methods",
        "Open Elective-I"
    ],

    "4": [
        "Mass Transfer-I",
        "Chemical Reaction Engineering-I",
        "Process Instrumentation and Control",
        "Chemical Technology",
        "Open Elective-II"
    ],

    "5": [
        "Mass Transfer-II",
        "Chemical Reaction Engineering-II",
        "Process Dynamics and Control",
        "Chemical Process Equipment Design",
        "Department Elective-I",
        "Open Elective-III"
    ],

    "6": [
        "Process Plant Design",
        "Process Modeling and Simulation",
        "Department Elective-II",
        "Department Elective-III",
        "Mini Project",
        "Open Elective-IV"
    ],

    "7": [
        "Department Elective-IV",
        "Department Elective-V",
        "Industrial Internship / Project Phase-I",
        "Honours / Minor Elective-I",
        "Honours / Minor Elective-II"
    ],

    "8": [
        "B.Tech Project Phase-II",
        "Department Elective-VI",
        "Honours / Minor Elective-III",
        "Honours / Minor Elective-IV"
    ]
},
   "MME": {
    "1": [
        "Mathematics-I",
        "Basic Economics",
        "Programming with Python",
        "Programming with Python Lab",
        "Communication Skills Lab",
        "Universal Human Values"
    ],

    "2": [
        "Engineering Chemistry",
        "Engineering Mechanics",
        "Basic Electrical and Electronics Engineering",
        "Environmental Science",
        "Materials Science",
        "Engineering Drawing"
    ],

    "3": [
        "Physical Metallurgy",
        "Thermodynamics of Materials",
        "Mechanical Behaviour of Materials",
        "Manufacturing Processes",
        "Applied Probability and Statistics",
        "Open Elective-I"
    ],

    "4": [
        "Extractive Metallurgy",
        "Phase Transformations",
        "Materials Characterization",
        "Foundry Technology",
        "Open Elective-II"
    ],

    "5": [
        "Iron and Steel Making",
        "Non-Ferrous Extractive Metallurgy",
        "Heat Treatment of Materials",
        "Corrosion Engineering",
        "Department Elective-I",
        "Open Elective-III"
    ],

    "6": [
        "Powder Metallurgy",
        "Composite Materials",
        "Department Elective-II",
        "Department Elective-III",
        "Mini Project",
        "Open Elective-IV"
    ],

    "7": [
        "Department Elective-IV",
        "Department Elective-V",
        "Industrial Internship / Project Phase-I",
        "Honours / Minor Elective-I",
        "Honours / Minor Elective-II"
    ],

    "8": [
        "B.Tech Project Phase-II",
        "Department Elective-VI",
        "Honours / Minor Elective-III",
        "Honours / Minor Elective-IV"
    ]
},
   "BARCH": {
    "1": [
        "Architectural Design-I",
        "Building Construction-I",
        "Architectural Graphics-I",
        "Theory of Structures-I",
        "Mathematics",
        "Communication Skills",
        "Universal Human Values"
    ],

    "2": [
        "Architectural Design-II",
        "Building Construction-II",
        "Architectural Graphics-II",
        "Theory of Structures-II",
        "Building Materials",
        "Environmental Studies"
    ],

    "3": [
        "Architectural Design-III",
        "Building Construction-III",
        "History of Architecture-I",
        "Theory of Structures-III",
        "Climatology",
        "Surveying"
    ],

    "4": [
        "Architectural Design-IV",
        "Building Construction-IV",
        "History of Architecture-II",
        "Theory of Structures-IV",
        "Building Services-I",
        "Computer Applications in Architecture"
    ],

    "5": [
        "Architectural Design-V",
        "Building Construction-V",
        "Landscape Architecture",
        "Building Services-II",
        "Estimating and Costing",
        "Open Elective-I"
    ],

    "6": [
        "Architectural Design-VI",
        "Urban Planning",
        "Housing",
        "Building Services-III",
        "Professional Practice-I",
        "Open Elective-II"
    ],

    "7": [
        "Architectural Design-VII",
        "Urban Design",
        "Interior Design",
        "Professional Practice-II",
        "Department Elective-I"
    ],

    "8": [
        "Architectural Design-VIII",
        "Dissertation",
        "Department Elective-II",
        "Department Elective-III",
        "Seminar"
    ],

    "9": [
        "Professional Training / Internship"
    ],

    "10": [
        "Architectural Thesis"
    ]
},
}


@router.get("/dashboard", response_model=AnalyticsResponse)
async def dashboard(user_id: str | None = Depends(get_optional_user_id)):
    db = get_db()
    total_resources = await db.resources.count_documents({})
    total_users = await db.users.count_documents({})

    pipeline_downloads = [
        {"$group": {"_id": None, "total": {"$sum": "$downloads"}}}
    ]
    dl_result = await db.resources.aggregate(pipeline_downloads).to_list(1)
    total_downloads = dl_result[0]["total"] if dl_result else 0

    by_branch = await db.resources.aggregate(
        [{"$group": {"_id": "$branch", "count": {"$sum": 1}}}]
    ).to_list(20)

    by_type = await db.resources.aggregate(
        [{"$group": {"_id": "$resource_type", "count": {"$sum": 1}}}]
    ).to_list(20)

    top_cursor = db.resources.find().sort("downloads", -1).limit(5)
    top_resources = []
    async for doc in top_cursor:
        top_resources.append(ResourceResponse(**serialize_resource(doc)))

    recent_cursor = db.resources.find().sort("created_at", -1).limit(5)
    recent_uploads = []
    async for doc in recent_cursor:
        recent_uploads.append(ResourceResponse(**serialize_resource(doc)))

    return AnalyticsResponse(
        total_resources=total_resources,
        total_users=total_users,
        total_downloads=total_downloads,
        by_branch=[{"branch": b["_id"], "count": b["count"]} for b in by_branch],
        by_type=[{"type": t["_id"], "count": t["count"]} for t in by_type],
        top_resources=top_resources,
        recent_uploads=recent_uploads,
    )


@router.get("/syllabus/{branch}")
async def get_syllabus(branch: str):
    branch_upper = branch.upper()
    if branch_upper not in SYLLABUS:
        return {"branch": branch, "semesters": {}}
    return {"branch": branch_upper, "semesters": SYLLABUS[branch_upper]}
