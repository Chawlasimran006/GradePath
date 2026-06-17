// ============================================================
// courseData.js — Chitkara University CSE Subject Database
// ============================================================
// HOW TO ADD A NEW SUBJECT:
// 1. Pick the correct year array (1, 2, 3, or 4).
// 2. Copy an existing subject block and paste it at the end.
// 3. Update: id, name, stWeight, etWeight, and extras.
//    - stWeight = Overall % weightage of Sessional Tests
//    - etWeight = Overall % weightage of End Term Exam
//    - extras   = Any other evaluation components (CE, FA, etc.)
//      Each extra needs: { id, label, weight }
//      The id should be unique, label is what the user sees,
//      and weight is its overall % contribution.
// 4. Make sure all weights add up to 100%.
// ============================================================

const courseData = {

  // ======================== 1st YEAR ========================
  1: [
    {
      id: "calc_stats",
      name: "Calculus and Statistical Analysis",
      code: "24APS1101",
      stWeight: 40,   // 40% overall for Sessional Tests
      etWeight: 60,   // 60% overall for End Term
      extras: []      // No FA or CE components
    },
    {
      id: "diff_eq",
      name: "Differential Equations and Transformations",
      code: "24APS2101",
      stWeight: 40,
      etWeight: 60,
      extras: []
    },
    {
      id: "deca",
      name: "Digital Electronics and Computer Architecture",
      code: "24CSE0103",
      stWeight: 25,   // 25% overall for Sessional Tests
      etWeight: 50,   // 50% overall for End Term
      extras: [       // 25% total for Continuous Evaluations (Lab)
        { id: "ce11", label: "CE-1.1 (Lab Performance)", weight: 10 },
        { id: "ce12", label: "CE-1.2 (Project Work)", weight: 15 }
      ]
    },
    {
      id: "frontend_eng",
      name: "Front End Engineering",
      code: "24CSE0102",
      stWeight: 25,
      etWeight: 50,
      extras: [
        { id: "ce11", label: "CE-1.1 (Lab Performance)", weight: 10 },
        { id: "ce12", label: "CE-1.2 (Project Work)", weight: 15 }
      ]
    },
    {
      id: "fundamentals_cs",
      name: "Fundamentals of Computer Science",
      code: "24CSE0101",
      stWeight: 25,
      etWeight: 50,
      extras: [
        { id: "ce11", label: "CE-1.1 (Lab Performance)", weight: 10 },
        { id: "ce12", label: "CE-1.2 (Project Work)", weight: 15 }
      ]
    },
    {
      id: "physics",
      name: "Modern and Computational Physics",
      code: "24APS1102",
      stWeight: 40,
      etWeight: 60,
      extras: []
    },
    {
      id: "os",
      name: "Operating System",
      code: "24CSE0104",
      stWeight: 25,
      etWeight: 50,
      extras: [
        { id: "ce11", label: "CE-1.1 (Lab Performance)", weight: 10 },
        { id: "ce12", label: "CE-1.2 (Project Work)", weight: 15 }
      ]
    },
    {
      id: "python",
      name: "Python Programming",
      code: "24CSE0105",
      stWeight: 25,
      etWeight: 50,
      extras: [
        { id: "ce11", label: "CE-1.1 (Lab Performance)", weight: 10 },
        { id: "ce12", label: "CE-1.2 (Project Work)", weight: 15 }
      ]
    },
    {
      id: "source_code_mgmt",
      name: "Source Code Management",
      code: "24CSE0106",
      stWeight: 25,
      etWeight: 50,
      extras: [
        { id: "ce11", label: "CE-1.1 (Lab Performance)", weight: 10 },
        { id: "ce12", label: "CE-1.2 (Project Work)", weight: 15 }
      ]
    }
  ],

  // ======================== 2nd YEAR ========================
  2: [
    {
      id: "ds_oop2",
      name: "Data Structures using OOP-II",
      code: "24CSE0201",
      stWeight: 25,
      etWeight: 50,
      extras: [
        { id: "ce11", label: "CE-1.1 (Lab Performance)", weight: 10 },
        { id: "ce12", label: "CE-1.2 (Project Work)", weight: 15 }
      ]
    }
  ],

  // ======================== 3rd YEAR ========================
  3: [],

  // ======================== 4th YEAR ========================
  4: []
};
