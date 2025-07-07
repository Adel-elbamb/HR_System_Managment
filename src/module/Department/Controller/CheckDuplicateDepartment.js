import Department from "../../../../DB/models/Department.model.js";

export const checkDuplicateDepartment = async (
  departmentName,
  excludeId = null
) => {
  const query = {
    departmentName: { $regex: new RegExp(`^${departmentName}$`, "i") },
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existingDepartment = await Department.findOne(query);
  return existingDepartment;
};
