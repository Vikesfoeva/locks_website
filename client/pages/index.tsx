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
import { DeleteIcon } from "@nextui-org/shared-icons";

function index() {
  const [gameData, setGameData] = useState([]);

  const columns_choices = [
    {key: "cfb_nfl", label: "CFB / NFL"},
    {key: "name_away", label: "Away"},
    {key: "name_home", label: "Home Home"},
    {key: "choice", label: "Choice"},
    {key: "value", label: "Value"},
    {key: "time", label: "Game Time ET"},
    {key: "button", label: "Actions"}
  ];
  
  const blankRow = {
    "cfb_nfl": "TBD",
    "name_away": "",
    "name_home": "",
    "choice": "",
    "value": "",
    "time": "",
  }
  
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

  fillChoicesTable()

  const statusColorMap = {
    "false": "primary",
    "true": "success", 
  }
  
  // Need to update this to update the state of the application
  function fillChoicesTable() {
    const needed = 3 - rows_choices.length
    for (let i = 0; i < needed; i++) {
      const deepCopy = JSON.parse(JSON.stringify(blankRow));
      deepCopy["key"] = i;
      rows_choices.push(deepCopy)
    }
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

  function handleMakeSelection(game: object, choice: string) {
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

      if (gameData[i]['name_home'] === getCastedKey("name_home", game) && gameData[i]['name_away'] === getCastedKey("name_away", game)) {
        foundIndexForRow = i
      }
    }

    const isSelectedBody: {
      over: boolean,
      under: boolean,
      line_away: boolean,
      line_home: boolean,
    } = gameData[foundIndexForRow]['selected']

    function getCastedKey(key: string, inputObj: object): boolean|string {
      return inputObj[key as keyof typeof inputObj];
    }

    function setCastedKey(key: string, inputObj: object, newVal: boolean,): undefined {
      inputObj[key as keyof typeof inputObj];
    }

    const isSelected: boolean|string = getCastedKey(choice, isSelectedBody);

    const polishChoice = {
      under: 'Under',
      over: 'Over',
      line_home: "Home Line",
      line_away: "Away Line"
    }
    
    if (isSelected) {
      gameData[foundIndexForRow]["selected"][choice] = false;
      setGameData(updatedGameData)
      for (let i = 0; i < rows_choices.length; i++) {
        const ele = rows_choices[i];
        const comp = rows_options[foundIndexForRow];
        if (ele['choice'] === getCastedKey(choice, polishChoice) &&
          ele['name_away'] === comp['name_away']
        ) {
          rows_choices.splice(i, 1);
        }
      }
    } else if (canBeSelected) {
      gameData[foundIndexForRow]["selected"][choice] = true;
      setGameData(updatedGameData)
      const away = gameData[foundIndexForRow]['name_away'];
      const home = gameData[foundIndexForRow]['name_home'];
      rows_choices.push({
        "key": `${away}|${home}|${choice}|`,
        "cfb_nfl": gameData[foundIndexForRow]['cfb_nfl'],
        "name_away": away,
        "name_home": home,
        "choice": getCastedKey(choice, polishChoice),
        "value": 0,
        "time": gameData[foundIndexForRow]['time'],
        "button": 123
      });
    }

    for (let i = rows_choices.length-1; i >= 0; i--) {
      if (rows_choices[i]['cfb_nfl'] === "TBD") {
        rows_choices.splice(i, 1);
      }
    }
    fillChoicesTable();
  }

  useEffect(() => {
    console.log(window.location.href)
    fetch("http://localhost:8080/api/testing")
    .then(res => res.json())
    .then((out) => {
      setGameData(out.data);
      console.log(out);
    })
  }, [])
  return (
    <main>
    {/* <Table 
      isStriped 
      aria-label="Locks Choices Table"
      onCellAction={(ele) => {
        console.log("Implement delete funciton here")
        console.log(ele)
      }}
      >
      <TableHeader>
        {columns_choices.map((column) =>
          <TableColumn key={column.key}>{column.label}</TableColumn>
        )}
      </TableHeader>
      <TableBody>
        {rows_choices.map((row) =>
          <TableRow key={row.key}>
            {(columnKey) => {
              if (columnKey === "button" && row['cfb_nfl'] !== "TBD"){
                return <TableCell>
                  <span className="text-lg text-danger cursor-pointer active:opacity-50"><DeleteIcon /></span>
                  </TableCell>
              } else {
                return <TableCell>{getKeyValue(row, columnKey)} </TableCell>
              }
            }
            }
          </TableRow>
        )}
      </TableBody>
    </Table> */}

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