// import './App.css';
import GroupDrawer from './GroupDrawer';
import EventDisplay from './EventsDisplay';
import ScheduleDisplay from './ScheduleDisplay';
import RoutineDisplay from './RoutineDisplay';
import ScriptDisplay from './ScriptsDisplay';

import { ThemeProvider } from '@material-ui/core/styles';
import { Switch, Route, Redirect } from 'react-router-dom';

import theme from './theme';

function App() {

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <GroupDrawer>
          <Switch>
            <Route exact path='/'>
              <Redirect to='/events' />
            </Route>
            <Route path='/events'>
              <EventDisplay />
            </Route>
            <Route path='/schedule'>
              <ScheduleDisplay />
            </Route>
            <Route path='/routines'>
              <RoutineDisplay />
            </Route>
            <Route path='/scripts'>
              <ScriptDisplay />
            </Route>
          </Switch>
        </GroupDrawer>
      </ThemeProvider>
    </div>
  );
}

export default App;
