'use client'
import React, { useEffect, useState} from 'react'
import Script from "next/script";
//import { useRouter } from "next/navigation";
import {  Table,  TableHeader,  TableBody,  TableColumn,  TableRow,  TableCell, getKeyValue} from "@nextui-org/table";
//import Table from '@mui/material/Table';
//import TableBody from '@mui/material/TableBody';
//import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
//import TableRow from '@mui/material/TableRow';
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

  const buttonRows: string[] = ["line_away", "line_home", "over", "under"]; 
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

  function checkButtonStatus(inputRow: string) {
    //Ensures that no more than 3 are selected at once
    const inputArr: string[] = inputRow.split("|");
    const choice: string = inputArr[6];
    
    let canBeSelected: boolean = true;
    let foundIndexForRow: number = -1;
    let countActive: number = 0;

    for (let i: number = 0; i < rows_options.length; i++) {
      const ele: {      
        over: boolean,
        under: boolean,
        line_away: boolean,
        line_home: boolean
      } = rows_options[i]['selected']

      if (ele['over']) {countActive++}
      if (ele['under']) {countActive++}
      if (ele['line_away']) {countActive++}
      if (ele['line_home']) {countActive++}

      if (countActive > 2) {
        canBeSelected = false;
      }

      if (rows_options[i]['name_home'] === inputArr[0] && rows_options[i]['name_away'] === inputArr[1]) {
        foundIndexForRow = i
      }
    }



    const isSelectedBody: {
      over: boolean,
      under: boolean,
      line_away: boolean,
      line_home: boolean,
    } = rows_options[foundIndexForRow]['selected']

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
      setCastedKey(choice, isSelectedBody, false);
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
      setCastedKey(choice, isSelectedBody, true);
      const away = rows_options[foundIndexForRow]['name_away'];
      const home = rows_options[foundIndexForRow]['name_home'];
      rows_choices.push({
        "key": `${away}|${home}|${choice}|`,
        "cfb_nfl": rows_options[foundIndexForRow]['cfb_nfl'],
        "name_away": away,
        "name_home": home,
        "choice": getCastedKey(choice, polishChoice),
        "value": 0,
        "time": rows_options[foundIndexForRow]['time'],
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
    <Table 
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
    </Table>

    {/* Locks Table */}
    <div>
    <Table 
      isStriped 
      aria-label="Locks Table"
      onCellAction={(ele) => {
        const eleString =  ele as string;
        const row: string[] = eleString.split("|");
        if (buttonRows.includes(row[6])) {
          checkButtonStatus(eleString);
        }
      }}
      >
      <TableHeader>
        {columns_options.map((column) =>
          <TableColumn 
            key={column.key}
            >
              {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody>
          { 
            gameData.map((game: any) => {
              return <TableRow key={game['key']}>
                <TableCell key={`${game['key']}_cfb_nfl`}>{game['cfb_nfl']}</TableCell>
                <TableCell key={`${game['key']}_name_away`}>{game['name_away']}</TableCell>
                <TableCell key={`${game['key']}_line_away`}>
                  <Chip label={game['line_away']} color={
                      statusColorMap[game["selected"]["line_away"] as string]
                    }/>
                </TableCell>
                <TableCell key={`${game['key']}_name_home`}>{game['name_home']}</TableCell>
                <TableCell key={`${game['key']}_line_home`}>
                  <Chip label={game['line_home']}  color={
                      statusColorMap[game["selected"]["line_home"] as string]
                    }/>
                </TableCell>
                <TableCell key={`${game['key']}_over`}>
                  <Chip label={game['over']}  color={
                      statusColorMap[game["selected"]["over"] as string]
                    }/>
                </TableCell>
                <TableCell key={`${game['key']}_under`}>
                <Chip label={game['under']}  color={
                      statusColorMap[game["selected"]["under"] as string]
                    }/>
                </TableCell>
                <TableCell key={`${game['key']}_time`}>{game['time']}</TableCell>
              </TableRow>
          })}
      </TableBody>
    </Table>
    </div>
  </main>
  )
}

export default index