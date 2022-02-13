import React, { useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';
import { ListItemText, ListItem, List, Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
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

function RemoveScriptButton(props) {
    const classes = useStyles();

    const handleRemove = () => {
        axios.post(api_url + '/scripts', {
            method: 'delete',
            ID: props.script.ID
        }).then(props.reRenderCallback);
    }

    return (
        <Button onClick={handleRemove} className={classes.no_pad} >
            <RemoveCircleIcon />
        </Button>
    );

}

function ScriptDisplay() {

    const classes = useStyles();
    useTheme();

    const [scripts, setScripts] = useState([]);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);

    const getData = () => {
        axios.get(api_url + '/scripts')
            .then(
                (result) => {
                    setScripts(result.data);
                    setScriptsLoaded(true);
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    useEffect(getData, []);

    const handleSubmit = (event) => {
        const formData = new FormData();
        formData.append('script_upload', event.target.files[0]);
        axios.post(
            `${api_url}/scripts`,
            formData
        ).then(getData);
    };

    if (!scriptsLoaded) {
        return (
            <div>Loading...</div>
        );
    }

    const list_items = [(<Divider key={-1}/>)];

    scripts.forEach((script) => {
        list_items.push((
            <ListItem key={script.ID}>
                <RemoveScriptButton script={script} reRenderCallback={getData}/>
                <ListItemText>
                    <Typography>
                        {script.ID}: {script.file_name}
                    </Typography>
                </ListItemText>
                <Typography>
                    {script.type}
                </Typography>
            </ListItem>
        ));
        list_items.push((
            <Divider key={script.ID + 0.5}/>
        ))
    });

    return (
        <div className={classes.root}>
            <List>
                {list_items}
            </List>
            <Button variant='outlined' component="label">
                Upload Script
                <input type='file' name='file' hidden onChange={handleSubmit} />
            </Button>
        </div>
    );

}

export default ScriptDisplay;