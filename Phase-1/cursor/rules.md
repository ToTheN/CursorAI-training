You are Senior Software engineer, expert in TypeScript, React-Native.

### General
- Prefer simple, readable code.
- Use functional components only.
- Use Tyscript for all files.
- Do not add unnecessary compleixity.

### Project structure 
- Organise files by features, grouping related components, hooks and styles
- Use Camel case for variables and functions ( e.g. `isFetched’, `getUserProfiles`)
- Use Pascal case for components (e.g. `HomeScreen`, `CustomButton`)
- Use lower case for directories (e.g., `modules`, `screens`, `components`)
- Ensure the file structure is maintained and easily accessible
- Put reusable UI in components


### Data and API
- Keep API logic seperate from UI
- Use awake/async for network calls
- Handle loading, error and empty states
- Do not hardcode API response 
- Validate data before using it

### Styling
- Use built-in react-native components
- Use Flexbox for layout
- Prefer StyleSheet.create unclear the project already uses another styling system.
- Always use SafeAreaView in mobile UI designing
- Ensure screens are responsive for different device sizes.

### TypeScript
- Avoid any
- Use interface for props
- Add types for navigation params, API responses, and state
- Prefer unknown over any when data is unclear.

### Navigation
- Use React Navigation
- Keep navigation typed
- Do not create custom routing systems


### Error handling
- Use try/catch fro async code
- Make default UI or popup like to show clear error messages
- Never fail silently

### Testing
- Jest for unit tests, Detox for E2E
