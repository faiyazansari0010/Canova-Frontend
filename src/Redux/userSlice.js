import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  name: "",
  email: "",
  projects: [],
  sharedWorks: [],
  createdAt: "",
  updatedAt: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUserDetails: (state, action) => {
      const { name, email } = action.payload;
      state.name = name;
      state.email = email;
    },

    setUser: (state, action) => {
      if (!action.payload) return;
      const { _id, name, email, projects, sharedWorks, createdAt, updatedAt } =
        action.payload || {};

      state._id = _id || "";
      state.name = name || "";
      state.email = email || "";
      state.projects = projects || [];
      state.sharedWorks = sharedWorks || [];
      state.createdAt = createdAt || "";
      state.updatedAt = updatedAt || "";
    },

    addNewProject: (state, action) => {
      const { projectName, projectID } = action.payload;
      const newProject = {
        projectName,
        projectID,
        forms: [],
      };
      state.projects?.push(newProject);
    },

    addNewForm: (state, action) => {
      const { formName, formID, projectID } = action.payload;

      const project = state.projects?.find(
        (project) => project.projectID === projectID
      );

      const newForm = {
        formName,
        formID,
        isDraft: true,
        formPages: [],
      };

      project?.forms.push(newForm);
    },

    saveForm: (state, action) => {
      const { projectID, formID, formPages } = action.payload;
      const project = state.projects?.find(
        (proj) => proj.projectID === projectID
      );
      if (!project) {
        return;
      }
      const form = project?.forms?.find((f) => f?.formID === formID);
      if (!form) {
        return;
      }
      form.formPages = formPages;
    },

    publishForm: (state, action) => {
      const { currentProjectID, formID, formPages } = action.payload;
      const project = state.projects?.find(
        (proj) => proj.projectID === currentProjectID
      );
      if (!project) {
        return;
      }
      let form = project.forms.find((f) => f?.formID === formID);
      if (!form) {
        return;
      }

      form.isDraft = false;
      form.formPages = formPages;
    },

    moveFormToProject: (state, action) => {
      const { formID, sourceProjectID, targetProjectID } = action.payload;

      const sourceProject = state.projects?.find(
        (project) => project.projectID === sourceProjectID
      );
      const targetProject = state.projects?.find(
        (project) => project.projectID === targetProjectID
      );

      if (!sourceProject || !targetProject) return;

      const formIndex = sourceProject.forms.findIndex(
        (form) => form?.formID === formID
      );

      if (formIndex === -1) return;

      const [form] = sourceProject.forms.splice(formIndex, 1);
      targetProject.forms.push(form);
    },

    clearUser: (state) => {
      state._id = "";
      state.name = "";
      state.email = "";
      state.projects = [];
      state.sharedWorks = [];
      state.createdAt = "";
      state.updatedAt = "";
    },
  },
});

export const {
  saveForm,
  setUser,
  clearUser,
  setLoading,
  addNewProject,
  addNewForm,
  moveFormToProject,
  updateSharedWorks,
  publishForm,
  updateUserDetails,
} = userSlice.actions;
export default userSlice.reducer;
