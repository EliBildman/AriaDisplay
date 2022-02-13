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
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';

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

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleRoutineUpdate = (added_routine_id) => {
        let new_event = props.event;
        new_event.routines.push({ 'ID': added_routine_id });
        axios.post(api_url + '/events', {
            method: 'update',
            ID: new_event.ID,
            event: new_event
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
        let new_event = props.event;
        new_event.routines.splice(props.ind, 1);
        axios.post(api_url + '/events', {
            method: 'update',
            ID: new_event.ID,
            event: new_event
        }).then(props.reRenderCallback);
    }

    return (
        <Button onClick={handleRemove} >
            <RemoveCircleIcon />
        </Button>
    )

}

function RemoveEventButton(props) {
    const classes = useStyles();

    const handleRemove = () => {
        axios.post(api_url + '/events', {
            method: 'delete',
            ID: props.event.ID
        }).then(props.reRenderCallback);
    }

    return (
        <Button onClick={handleRemove} className={classes.no_pad} >
            <RemoveCircleIcon />
        </Button>
    );

}

function AddEventPannel(props) {

    const classes = useStyles();
    const [textValue, setTextValue] = useState('');

    const handleAdd = () => {
        
        if(textValue === '') return;

        const new_event = {
            name: textValue,
            routines: []
        };
        
        setTextValue('');
        
        axios.post(api_url + '/events', {
            method: 'create',
            event: new_event
        }).then(props.reRenderCallback);
    
    }

    return (
        <Box className={classes.add_pannel}>
            <Paper>
                <Button className={classes.moved_button} onClick={handleAdd}>
                    <AddCircleIcon />
                </Button>
                <TextField value={textValue} label='New Event' variant='outlined' onChange={e => setTextValue(e.target.value)} />
            </Paper>
        </Box>
    )

}

function RunEventButton(props) {

    const handlePlay = (e) => {
        e.stopPropagation();
        axios.post(api_url + '/events', {
            method: 'run',
            ID: props.event.ID
        });
    }

    return (
        <Button onClick={handlePlay} >
            <PlayCircleFilledIcon />
        </Button>
    )

}

function EventDisplay() {

    const classes = useStyles();
    useTheme();

    const [events, setEvents] = useState([]);
    const [eventsLoaded, setEventsLoaded] = useState(false);
    const [routines, setRoutines] = useState([]);
    const [routinesLoaded, setRoutinesLoaded] = useState(false);

    const getData = () => {

        axios.get(api_url + '/events')
            .then(
                (result) => {
                    setEvents(result.data);
                    setEventsLoaded(true);
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

    if (!eventsLoaded || !routinesLoaded) {
        return (
            <div>Loading...</div>
        );
    }

    const accordians = [];

    for (let _event of events) {

        const attached_routines = [];

        let ind = 0;
        for (let routine_id of _event.routines) {

            let routine = routines.find(r => r.ID === routine_id.ID); //find routine from ID

            attached_routines.push(
                <ListItem key={ind} >
                    <ListItemIcon>
                        <RemoveRoutineButton event={_event} ind={ind} reRenderCallback={getData} />
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

            ind++;

        }

        accordians.push(
            (
                <Accordion key={_event.ID}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <RunEventButton event={_event} reRenderCallback={getData} />
                        <RemoveEventButton event={_event} reRenderCallback={getData} />
                        <Typography className={classes.heading}>
                            {_event.ID + ': ' + _event.name}
                        </Typography>
                        <Typography className={classes.secondaryHeading}>
                            {_event.routines.length + ' Routine' + (_event.routines.length !== 1 ? 's' : '')}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails >
                        <List className={classes.full}>
                            {attached_routines}
                            <ListItem key='add new'>
                                <AddRoutineButton event={_event} routines={routines} reRenderCallback={getData} />
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
            <AddEventPannel reRenderCallback={getData}/>
        </div>
    );


}


export default EventDisplay;