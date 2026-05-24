import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: localStorage.getItem('theme') || 'dark',
  sidebarOpen: true,
  leftNavSidebarCollapsed: localStorage.getItem('leftNavSidebarCollapsed') === 'true',
  messagesSidebarCollapsed: localStorage.getItem('messagesSidebarCollapsed') === 'true',
  messagesSidebarWidth: parseInt(localStorage.getItem('messagesSidebarWidth')) || 320,
  profileSidebarExpanded: localStorage.getItem('profileSidebarExpanded') === 'true',
  profileSidebarWidth: parseInt(localStorage.getItem('profileSidebarWidth')) || 320,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleLeftNavSidebar: (state) => {
      state.leftNavSidebarCollapsed = !state.leftNavSidebarCollapsed;
      localStorage.setItem('leftNavSidebarCollapsed', state.leftNavSidebarCollapsed);
    },
    setLeftNavSidebarCollapsed: (state, action) => {
      state.leftNavSidebarCollapsed = action.payload;
      localStorage.setItem('leftNavSidebarCollapsed', action.payload);
    },
    toggleMessagesSidebar: (state) => {
      state.messagesSidebarCollapsed = !state.messagesSidebarCollapsed;
      localStorage.setItem('messagesSidebarCollapsed', state.messagesSidebarCollapsed);
    },
    setMessagesSidebarCollapsed: (state, action) => {
      state.messagesSidebarCollapsed = action.payload;
      localStorage.setItem('messagesSidebarCollapsed', action.payload);
    },
    setMessagesSidebarWidth: (state, action) => {
      state.messagesSidebarWidth = action.payload;
      localStorage.setItem('messagesSidebarWidth', action.payload);
    },
    toggleProfileSidebar: (state) => {
      state.profileSidebarExpanded = !state.profileSidebarExpanded;
      localStorage.setItem('profileSidebarExpanded', state.profileSidebarExpanded);
    },
    setProfileSidebarExpanded: (state, action) => {
      state.profileSidebarExpanded = action.payload;
      localStorage.setItem('profileSidebarExpanded', action.payload);
    },
    setProfileSidebarWidth: (state, action) => {
      state.profileSidebarWidth = action.payload;
      localStorage.setItem('profileSidebarWidth', action.payload);
    },
  },
});

export const { 
  toggleTheme, 
  toggleSidebar, 
  toggleLeftNavSidebar, 
  setLeftNavSidebarCollapsed,
  toggleMessagesSidebar, 
  setMessagesSidebarCollapsed, 
  setMessagesSidebarWidth, 
  toggleProfileSidebar, 
  setProfileSidebarExpanded, 
  setProfileSidebarWidth 
} = uiSlice.actions;
export default uiSlice.reducer;
