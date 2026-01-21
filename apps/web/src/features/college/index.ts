export { CollegeCard } from "./college-card";
export { CollegeModal } from "./college-modal";
export type { College } from "./types";

// UK Colleges data and utilities
export {
  ukColleges,
  getAllUKColleges,
  getUKCollegeById,
  searchUKColleges,
  filterUKColleges,
  getUKCollegeLocations,
  getUKCollegeCitySizes,
  type UKCollege,
} from "./uk-colleges";

// US Colleges data and utilities
export {
  usColleges,
  getAllUSColleges,
  getUSCollegeById,
  searchUSColleges,
  filterUSColleges,
  getUSCollegeStates,
  getUSCollegeCampusSettings,
  type USCollege,
} from "./us-colleges";
