'use client'
import React, { useEffect, useState} from 'react'
import Script from "next/script";
//import { useRouter } from "next/navigation";
// import {  Table,  TableHeader,  TableBody,  TableColumn,  TableRow,  TableCell, getKeyValue} from "@nextui-org/table";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import { Delete } from '@mui/icons-material';
import { Icon } from '@mui/material';

function index() {
  const [gameData, setGameData] = useState([]);
  const [choiceData, setChoiceData] = useState([]);

  const columns_choices = [
    {key: "cfb_nfl", label: "CFB / NFL"},
    {key: "name_away", label: "Away"},
    {key: "name_home", label: "Home Home"},
    {key: "choice", label: "Choice"},
    {key: "value", label: "Value"},
    {key: "time", label: "Game Time ET"},
    {key: "button", label: "Actions"}
  ];
  
  const rows_choices: {
    key: string|null,
    cfb_nfl: string,
    name_away: string,
    name_home: string,
    choice: string|Boolean,
    value: Number,
    time: string,
    button: any
  }[] = [];

  const statusColorMap = {
    "false": "primary",
    "true": "success", 
  }
  
  // Need to update this to update the state of the application
  function fillChoicesTable(existingRows: Object[]) {
    const newChoices: Object[] = [];
    for (let i: number = 0; i < existingRows.length; i++) {
      newChoices.push(existingRows[i])
    }

    for (let i: number = 0; i < (3 - existingRows.length); i++) {
      newChoices.push({
        "key": i,
        "cfb_nfl": "TBD",
        "name_away": "",
        "name_home": "",
        "choice": "",
        "value": "",
        "time": "",
    })};

    return newChoices;
  }
  
  const rows_options: {
    key: string|null,
    cfb_nfl: string,
    name_away: string,
    line_away: number,
    name_home: string,
    line_home: number,
    over: number,
    under: number,
    time: string,
    selected: {
      over: boolean,
      under: boolean,
      line_away: boolean,
      line_home: boolean,
    }
  }[] = [];


  const columns_options = [
    {key: "cfb_nfl", label: "CFB / NFL"},
    {key: "name_away", label: "Away"},
    {key: "line_away", label: "Away Line"},
    {key: "name_home",label: "Home"},
    {key: "line_home", label: "Home Line"},
    {key: "over", label: "Over" },
    {key: "under", label: "Under" },
    {key: "time", label: "Game Time EST"},
  ];

  function handleMakeSelection(game: object, choice: string, isdeletion: boolean = false) {
    //Ensures that no more than 3 are selected at once
    let canBeSelected: boolean = true;
    let foundIndexForRow: number = -1;
    let countActive: number = 0;
    const updatedGameData: object[] = [];

    for (let i: number = 0; i < gameData.length; i++) {
      updatedGameData.push(gameData[i]);
      const ele: {      
        over: boolean,
        under: boolean,
        line_away: boolean,
        line_home: boolean
      } = gameData[i]['selected']

      if (ele['over']) {countActive++}
      if (ele['under']) {countActive++}
      if (ele['line_away']) {countActive++}
      if (ele['line_home']) {countActive++}

      if (countActive > 2) {
        canBeSelected = false;
      }

      if (gameData[i]['name_home'] === game['name_home'] && gameData[i]['name_away'] === game['name_away']) {
        foundIndexForRow = i
      }
    }

    const isSelectedBody: {
      over: boolean,
      under: boolean,
      line_away: boolean,
      line_home: boolean,
    } = gameData[foundIndexForRow]['selected']

    const isSelected: boolean|string = isSelectedBody[choice];

    const polishChoice = {
      under: 'Under',
      over: 'Over',
      line_home: "Home Line",
      line_away: "Away Line"
    }
    const objChoice = {
      under: 'under',
      over: 'over',
      line_home: "line_home",
      line_away: "line_away",
      Under: 'under',
      Over: 'over',
      "Home Line": "line_home",
      "Away Line": "line_away",
    }
    const updatedChoices: Object[] = [];
    for (let i: number = 0; i < choiceData.length; i++) {
      if (choiceData[i]["cfb_nfl"] !== "TBD") {
        updatedChoices.push(choiceData[i]);
      }
    }

    if (isSelected || isdeletion) {
      gameData[foundIndexForRow]["selected"][objChoice[choice]] = false;
      
      // Remove from choices
      for (let i = 0; i < updatedChoices.length; i++) {
        const ele = updatedChoices[i];
        const comp = gameData[foundIndexForRow];
        if ((ele['choice'] === polishChoice[choice] || ele['choice'] === choice) &&
          ele['name_away'] === comp['name_away']
        ) {
          updatedChoices.splice(i, 1);
        }
      }

    } else if (canBeSelected) {
      gameData[foundIndexForRow]["selected"][objChoice[choice]] = true;
      const away = gameData[foundIndexForRow]['name_away'];
      const home = gameData[foundIndexForRow]['name_home'];
      updatedChoices.push({
        "key": `${away}|${home}|${choice}|`,
        "cfb_nfl": gameData[foundIndexForRow]['cfb_nfl'],
        "name_away": away,
        "name_home": home,
        "choice": polishChoice[choice],
        "value": 0,
        "time": gameData[foundIndexForRow]['time'],
      });
    }

    setGameData(updatedGameData)
    setChoiceData(fillChoicesTable(updatedChoices));
  }

  useEffect(() => {
    fetch("http://localhost:8080/api/testing")
    .then(res => res.json())
    .then((out) => {setGameData(out.data);});
    setChoiceData(fillChoicesTable([]));
  }, [])
  return (
    <main>
      <TableContainer>
        <Table >
          <TableHead>
            <TableRow>
              {columns_choices.map((column) =>
                <TableCell key={column.key}>{column.label}</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {choiceData.map((row) =>{
              if (row['cfb_nfl'] === "TBD") {
                return <TableRow key={row.key}>
                        <TableCell>{row['cfb_nfl']}</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
              }
              return <TableRow key={row.key}>
                        <TableCell>{row['cfb_nfl']}</TableCell>
                        <TableCell>{row['name_away']}</TableCell>
                        <TableCell>{row['name_home']}</TableCell>
                        <TableCell>{row['choice']}</TableCell>
                        <TableCell>{row['value']}</TableCell>
                        <TableCell>{row['time']}</TableCell>
                        <TableCell><IconButton color="error" onClick={() => {handleMakeSelection(row, row['choice'], true)}}><Delete /></IconButton></TableCell>
                      </TableRow>
            }
            )}
          </TableBody>
        </Table>
      </TableContainer>

    {/* Locks Table */}
    <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
        {columns_options.map((column) =>
          <TableCell 
            key={column.key}
            >
              {column.label}
          </TableCell>
        )}
        </TableRow>
      </TableHead>
      <TableBody>
          { 
            gameData.map((game: any) => {
              return <TableRow key={game['key']}>
                <TableCell key={`${game['key']}_cfb_nfl`}>{game['cfb_nfl']}</TableCell>
                <TableCell key={`${game['key']}_name_away`}>{game['name_away']}</TableCell>
                <TableCell key={`${game['key']}_line_away`}>
                  <Chip label={game['line_away']} 
                      color={statusColorMap[game["selected"]["line_away"] as string]}
                      onClick={() => handleMakeSelection(game, "line_away")}
                    />
                </TableCell>
                <TableCell key={`${game['key']}_name_home`}>{game['name_home']}</TableCell>
                <TableCell key={`${game['key']}_line_home`}>
                  <Chip label={game['line_home']}  
                      color={statusColorMap[game["selected"]["line_home"] as string]}
                      onClick={() => handleMakeSelection(game, "line_home")}
                    />
                </TableCell>
                <TableCell key={`${game['key']}_over`}>
                  <Chip label={game['over']} 
                    color={statusColorMap[game["selected"]["over"] as string]}
                    onClick={() => handleMakeSelection(game, "over")}
                    />
                </TableCell>
                <TableCell key={`${game['key']}_under`}>
                <Chip label={game['under']} 
                    color={statusColorMap[game["selected"]["under"] as string]}
                    clickable={true}
                    onClick={() => handleMakeSelection(game, "under")}
                  />
                </TableCell>
                <TableCell key={`${game['key']}_time`}>{game['time']}</TableCell>
              </TableRow>
          })}
      </TableBody>
    </Table>
    </TableContainer>
  </main>
  )
}

export default index