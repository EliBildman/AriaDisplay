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
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

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
    actionlist: {
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
    },
    half_full: {
        width: '50%'
    }

}));

function AddActionButton(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (routine) => {
        setAnchorEl(routine.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleActionUpdate = (added_action) => {
        let new_routine = props.routine;
        new_routine.sequence.push({
            'name': added_action,
            'param': {}
        });
        axios.post(api_url + '/routines', {
            method: 'update',
            ID: new_routine.ID,
            routine: new_routine
        }).then(props.reRenderCallback);
    }

    const items = [];

    for (let action of props.actions) {
        items.push((
            <MenuItem key={action} onClick={() => {
                handleActionUpdate(action);
                handleClose();
            }}>{action}</MenuItem>
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

function RemoveActionButton(props) {

    const handleRemove = () => {
        let new_routine = props.routine;
        new_routine.sequence.splice(props.ind, 1);
        axios.post(api_url + '/routines', {
            method: 'update',
            ID: new_routine.ID,
            routine: new_routine
        }).then(props.reRenderCallback);
    }

    return (
        <Button onClick={handleRemove} >
            <RemoveCircleIcon />
        </Button>
    )

}

function RemoveRoutineButton(props) {
    const classes = useStyles();

    const handleRemove = () => {
        axios.post(api_url + '/routines', {
            method: 'delete',
            ID: props.routine.ID
        }).then(props.reRenderCallback);
    }

    return (
        <Button onClick={handleRemove} className={classes.no_pad} >
            <RemoveCircleIcon />
        </Button>
    );

}

function AddRoutinePannel(props) {

    const classes = useStyles();
    const [textValue, setTextValue] = useState('');

    const handleAdd = () => {
        
        if(textValue === '') return;

        const new_routine = {
            name: textValue,
            sequence: []
        };
        
        setTextValue('');
        
        axios.post(api_url + '/routines', {
            method: 'create',
            routine: new_routine
        }).then(props.reRenderCallback);
    
    }

    return (
        <Box className={classes.add_pannel}>
            <Paper>
                <Button className={classes.moved_button} onClick={handleAdd}>
                    <AddCircleIcon />
                </Button>
                <TextField value={textValue} label='New Routine' variant='outlined' onChange={e => setTextValue(e.target.value)} />
            </Paper>
        </Box>
    )

}

function RunRoutineButton(props) {

    const handlePlay = (e) => {
        e.stopPropagation();
        axios.post(api_url + '/routines', {
            method: 'run',
            ID: props.routine.ID
        });
    }

    return (
        <Button onClick={handlePlay} >
            <PlayCircleFilledIcon />
        </Button>
    )

}

function ParamDisplay(props) {

    const classes = useStyles();

    const is_valid_json = (str) => {
        try {
            JSON.parse(str);
        } catch(e) {
            return false;
        }
        return true;
    }

    const [param, setParam] = useState(JSON.stringify(props.routine.sequence[props.ind].param));

    const handleChange = (e) => {
        setParam(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.keyCode === 13) { //is enter
            e.preventDefault();

            if(!is_valid_json(param)) {
                return;
            }

            const new_routine = props.routine;
            new_routine.sequence[props.ind].param = JSON.parse(param);

            axios.post(api_url + '/routines', {
                method: 'update',
                ID: new_routine.ID,
                routine: new_routine 
            })
            .then(() => document.activeElement.blur())
            .then(props.reRenderCallback);

        }
    };

    return (
        <TextareaAutosize value={param} placeholder="Param" className={classes.half_full} onChange={handleChange} onKeyDown = {handleKeyDown}/>
    )

}

function RoutineDisplay() {

    const classes = useStyles();
    useTheme();

    const [routines, setRoutines] = useState([]);
    const [routinesLoaded, setRoutinesLoaded] = useState(false);
    const [actions, setActions] = useState([]);
    const [actionsLoaded, setActionsLoaded] = useState(false);

    const getData = () => {

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

        axios.get(api_url + '/actions')
            .then(
                (result) => {
                    setActions(result.data);
                    setActionsLoaded(true);
                },
                (error) => {
                    console.log(error);
                }
            );

    }

    useEffect(getData, []);

    if (!routinesLoaded || !actionsLoaded) {
        return (
            <div>Loading...</div>
        );
    }

    const accordians = [];

    for (let routine of routines) {

        const attached_actions = [];

        let ind = 0;
        for (let action of routine.sequence) {

            attached_actions.push(
                <ListItem key={ind} >
                    <ListItemIcon>
                        <RemoveActionButton routine={routine} reRenderCallback={getData} />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography>
                            {action.name}
                        </Typography>
                    </ListItemText>
                    <ParamDisplay routine={routine} ind={ind} reRenderCallback={getData} />
                </ListItem >
            )

            attached_actions.push((
                <Divider key={ind + 0.5}/>
            ))

            ind++;

        }

        accordians.push(
            (
                <Accordion key={routine.ID}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <RunRoutineButton routine={routine} reRenderCallback={getData} />
                        <RemoveRoutineButton routine={routine} reRenderCallback={getData} />
                        <Typography className={classes.heading}>
                            {routine.ID + ': ' + routine.name}
                        </Typography>
                        <Typography className={classes.secondaryHeading}>
                            {routine.sequence.length + ' Action' + (routine.sequence.length !== 1 ? 's' : '')}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails >
                        <List className={classes.full}>
                            {attached_actions}
                            <ListItem key='add new'>
                                <AddActionButton routine={routine} actions={actions} reRenderCallback={getData} />
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
            <AddRoutinePannel reRenderCallback={getData}/>
        </div>
    );


}


export default RoutineDisplay;