import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  name: "",
  email: "",
  projects: [],
  createdAt: "",
  updatedAt: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { _id, name, email } = action.payload;
      state._id = _id;
      state.name = name;
      state.email = email;
    },

    addNewProject: (state, action) => {
      const { projectName, projectID } = action.payload;
      const newProject = {
        projectName,
        projectID,
        forms: [],
      };
      state.projects.push(newProject);
    },

    addNewForm: (state, action) => {
      const { formName, formID, projectID } = action.payload;

      const project = state.projects.find(
        (project) => project.projectID === projectID
      );

      const newForm = {
        formName,
        formID,
        isDraft: false,
      };

      project.forms.push(newForm);
    },

    clearUser: () => ({
      ...initialState,
    }),
  },
});

export const { setUser, clearUser, setLoading, addNewProject, addNewForm } =
  userSlice.actions;
export default userSlice.reducer;
