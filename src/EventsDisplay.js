import React, { useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import axios from 'axios';
import { ListItemText, ListItem, ListItemIcon, List, Divider, Grid } from '@material-ui/core';
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

    return  (
        <Button onClick={handleRemove}>
            <RemoveCircleIcon />
        </Button>
    )

}

function AddEventButton() {



    
}

function EventDisplay() {

    const classes = useStyles();
    useTheme();
    const ref = React.createRef();

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

        let key = 0;
        for (let routine_id of _event.routines) {

            let routine = routines.find(r => r.ID === routine_id.ID); //find routine from ID

            attached_routines.push(
                <ListItem key={key} >
                    <ListItemIcon>
                        <RemoveRoutineButton event={_event} reRenderCallback={getData} />
                    </ListItemIcon>
                    <ListItemText>
                            <Typography>
                                {routine.ID}: {routine.name}
                            </Typography>
                    </ListItemText>
                </ListItem >
            )

            key++;

        }

        accordians.push(
            (
                <Accordion key={_event.ID}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography className={classes.heading}>
                            {_event.ID + ': ' + _event.name}
                        </Typography>
                        <Typography className={classes.secondaryHeading}>
                            {_event.routines.length + ' Attached Routine' + (_event.routines.length !== 1 ? 's' : '')}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
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
        </div>
    );


}


export default EventDisplay;