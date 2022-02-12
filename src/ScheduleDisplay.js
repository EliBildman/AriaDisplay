import React, { useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import axios from 'axios';
import { ListItemText, ListItem, ListItemIcon, List, Paper, Box, TextField, Divider } from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';


const api_url = 'http://localhost:3000'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    highlight: {
        backgroundColor: theme.palette.primary
    },
    full: {
        width: '100%'
    },
    routinelist: {
        width: '100%',
        direction: 'row',
        justifyContent: 'space-between'
    },
    vert_center: {
        // height: '20rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    no_pad: {
        padding: 0
    },
    add_pannel: {
        width: '100%',
        paddingTop: 10,
    },
    moved_button: {
        position: 'relative',
        top: '10px'
    }

}));

function AddRoutineButton(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (schedule) => {
        setAnchorEl(schedule.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleRoutineUpdate = (added_routine_id) => {
        let newschedule = props.schedule;
        newschedule.routines.push({ 'ID': added_routine_id });
        axios.post(api_url + '/schedules', {
            method: 'update',
            ID: newschedule.ID,
            schedule: newschedule
        }).then(props.reRenderCallback);
    }

    const items = [];

    for (let routine of props.routines) {
        items.push((
            <MenuItem key={routine.ID} onClick={() => {
                handleRoutineUpdate(routine.ID);
                handleClose();
            }}>{routine.ID}: {routine.name}</MenuItem>
        ))
    }

    return (
        <div>
            <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                <AddCircleIcon />
            </Button>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {items}
            </Menu>
        </div>
    );
}

function RemoveRoutineButton(props) {

    const handleRemove = () => {
        let newschedule = props.schedule;
        newschedule.routines.splice(props.ind, 1);
        axios.post(api_url + '/schedules', {
            method: 'update',
            ID: newschedule.ID,
            schedule: newschedule
        }).then(props.reRenderCallback);
    }

    return (
        <Button onClick={handleRemove} >
            <RemoveCircleIcon />
        </Button>
    )

}

function RemoveScheduleButton(props) {
    const classes = useStyles();

    const handleRemove = () => {
        axios.post(api_url + '/schedules', {
            method: 'delete',
            ID: props.schedule.ID
        }).then(props.reRenderCallback);
    }

    return (
        <Button onClick={handleRemove} className={classes.no_pad} >
            <RemoveCircleIcon />
        </Button>
    );

}

function AddSchedulePannel(props) {

    const classes = useStyles();
    const [nameValue, setNameValue] = useState('');
    const [cStrValue, setCStrValue] = useState('');

    const handleAdd = () => {

        if (nameValue === '' || cStrValue === '') return;

        const newschedule = {
            name: nameValue,
            cron_string: cStrValue,
            routines: []
        };

        setNameValue('');
        setCStrValue('');

        axios.post(api_url + '/schedules', {
            method: 'create',
            schedule: newschedule
        }).then(props.reRenderCallback);

    }

    return (
        <Box className={classes.add_pannel}>
            <Paper>
                <Button className={classes.moved_button} onClick={handleAdd}>
                    <AddCircleIcon />
                </Button>
                <TextField value={nameValue} label='Name' variant='outlined' onChange={e => setNameValue(e.target.value)} />
                <TextField value={cStrValue} label='Cron String' variant='outlined' onChange={e => setCStrValue(e.target.value)} />
            </Paper>
        </Box>
    )

}

function CronStringDisplay(props) {

    const [cronStr, setCronStr] = useState(props.schedule.cron_string);

    const handleChange = (e) => {
        setCronStr(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.keyCode === 13) { //is enter
            axios.post(api_url + '/schedules', {
                method: 'update',
                ID: props.schedule.ID,
                schedule: {
                    ID: props.schedule.ID,
                    name: props.schedule.name,
                    cron_string: cronStr,
                    routines: props.schedule.routines
                }
            })
            .then(() => document.activeElement.blur())
            .then(props.reRenderCallback);
        }
    };

    return (
        <TextField value={cronStr} label='Cron String' variant='outlined' onChange={handleChange} onKeyDown={handleKeyDown} />
    )

}

function ScheduleDisplay() {

    const classes = useStyles();
    useTheme();

    const [schedules, setschedules] = useState([]);
    const [schedulesLoaded, setschedulesLoaded] = useState(false);
    const [routines, setRoutines] = useState([]);
    const [routinesLoaded, setRoutinesLoaded] = useState(false);

    const getData = () => {

        axios.get(api_url + '/schedules')
            .then(
                (result) => {
                    setschedules(result.data);
                    setschedulesLoaded(true);
                },
                (error) => {
                    console.log(error);
                }
            );

        axios.get(api_url + '/routines')
            .then(
                (result) => {
                    setRoutines(result.data);
                    setRoutinesLoaded(true);
                },
                (error) => {
                    console.log(error);
                }
            );

    }

    useEffect(getData, []);

    if (!schedulesLoaded || !routinesLoaded) {
        return (
            <div>Loading...</div>
        );
    }

    const accordians = [];

    for (let schedule of schedules) {

        const attached_routines = [];

        let ind = 0;

        for (let routine_id of schedule.routines) {

            let routine = routines.find(r => r.ID === routine_id.ID); //find routine from ID

            attached_routines.push(
                <ListItem key={ind} >
                    <ListItemIcon>
                        <RemoveRoutineButton schedule={schedule} ind={ind} reRenderCallback={getData} />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography>
                            {routine.ID}: {routine.name}
                        </Typography>
                    </ListItemText>
                </ListItem >
            )

            attached_routines.push((
                <Divider key={ind + 0.5}/>
            ))

            ind += 1;

        }

        accordians.push(
            (
                <Accordion key={schedule.ID}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <RemoveScheduleButton schedule={schedule} reRenderCallback={getData} />
                        <Typography className={classes.heading}>
                            {schedule.ID + ': ' + schedule.name}
                        </Typography>
                        <Typography className={classes.secondaryHeading}>
                            {schedule.routines.length + ' Routine' + (schedule.routines.length !== 1 ? 's' : '')}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails >
                        <List className={classes.full}>
                            <ListItem key='cron str'>
                                <CronStringDisplay schedule={schedule} reRenderCallback={getData} />
                            </ListItem>
                            {attached_routines}
                            <ListItem key='add new'>
                                <AddRoutineButton schedule={schedule} routines={routines} reRenderCallback={getData} />
                            </ListItem>
                        </List>
                    </AccordionDetails>
                </Accordion>
            )
        )
    }

    return (
        <div className={classes.root}>
            {accordians}
            <AddSchedulePannel reRenderCallback={getData} />
        </div>
    );


}


export default ScheduleDisplay;