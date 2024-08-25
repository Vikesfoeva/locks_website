'use client'
import Script from "next/script";
import { useRouter } from "next/navigation";
import {  Table,  TableHeader,  TableBody,  TableColumn,  TableRow,  TableCell, getKeyValue} from "@nextui-org/table";
import {Chip} from "@nextui-org/chip";
import { DeleteIcon } from "@nextui-org/shared-icons";
import { Tooltip } from "@nextui-org/react";

// https://nextui.org/docs/components/button

const columns_choices = [
  {key: "cfb_nfl", label: "CFB / NFL"},
  {key: "name_away", label: "Away"},
  {key: "name_home", label: "Home Home"},
  {key: "choice", label: "Choice"},
  {key: "value", label: "Value"},
  {key: "time", label: "Game Time EST"},
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

const rows_choices = [];
fillChoicesTable()

function fillChoicesTable() {
  const needed = 3 - rows_choices.length
  for (let i = 0; i < needed; i++) {
    const deepCopy = JSON.parse(JSON.stringify(blankRow));
    deepCopy["key"] = i;
    rows_choices.push(deepCopy)
  }
}

const rows_options = [];
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

export default function LocksTable() {
  const router = useRouter();
  function checkButtonStatus(router, inputRow) {
    //Ensures that no more than 3 are selected at once
    const inputArr = inputRow.split("|");
    const choice = inputArr[6];
    let canBeSelected = true;
    let foundIndexForRow = -1;
    let countActive = 0;

    for (let i = 0; i < rows_options.length; i++) {
      const ele = rows_options[i];

      if (ele['selected']['over']) {countActive++}
      if (ele['selected']['under']) {countActive++}
      if (ele['selected']['line_away']) {countActive++}
      if (ele['selected']['line_home']) {countActive++}

      if (countActive > 2) {
        canBeSelected = false;
      }

      if (rows_options[i]['name_home'] === inputArr[0] && rows_options[i]['name_away'] === inputArr[1]) {
        foundIndexForRow = i
      }
    }

    const isSelected = rows_options[foundIndexForRow]['selected'][choice];
    const polishChoice = {
      under: 'Under',
      over: 'Over',
      line_home: "Home Line",
      line_away: "Away Line"
    }

    if (isSelected) {
      rows_options[foundIndexForRow]['selected'][choice] = false;
      for (let i = 0; i < rows_choices.length; i++) {
        const ele = rows_choices[i];
        const comp = rows_options[foundIndexForRow];
        if (ele['choice'] === polishChoice[choice] &&
          ele['name_away'] === comp['name_away']
        ) {
          rows_choices.splice(i, 1);
        }
      }
    } else if (canBeSelected) {
      rows_options[foundIndexForRow]['selected'][choice] = true;
      const away = rows_options[foundIndexForRow]['name_away'];
      const home = rows_options[foundIndexForRow]['name_home'];
      rows_choices.push({
        "key": `${away}|${home}|${choice}|`,
        "cfb_nfl": rows_options[foundIndexForRow]['cfb_nfl'],
        "name_away": away,
        "name_home": home,
        "choice": polishChoice[choice],
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
    router.refresh();
  }
  const buttonRows = ["line_away", "line_home", "over", "under"]; 
  const statusColorMap = {
    "false": "primary",
    "true": "success", 
  }
  return (
      <main>
      <Script 
        src="testing.js"
        onLoad={async ()=>{
          const results = await testDataReading();
          for (let i = 0; i < results.length; i++) {
            const ele = results[i];
            const homeName = ele['home_team'];
            const awayName = ele['away_team'];
            let total = 0;
            let homeLine = 0;
            let awayLine = 0;
            rows_options.push({
              key: `${homeName}|${awayName}|${i}|`,
              cfb_nfl: ele['sport_title'],
              name_away: awayName,
              line_away: awayLine,
              name_home: homeName,
              line_home: homeLine,
              under: total,
              over: total,
              time: ele['commence_time'],
              selected: {
                over: false,
                under: false,
                line_away: false,
                line_home: false,
              } 
            })
          }
          router.refresh();
        }}
      />

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
                    <Tooltip color="danger" content="Delete selection">
                    <span className="text-lg text-danger cursor-pointer active:opacity-50"><DeleteIcon /></span>
                    </Tooltip>
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
        isHeaderSticky = "true"
        aria-label="Locks Table"
        onCellAction={(ele) => {
          const row = ele.split("|");
          if (buttonRows.includes(row[6])) {
            checkButtonStatus(router, ele);
          }
        }}
        >
        <TableHeader>
          {columns_options.map((column) =>
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody>
          {rows_options.map((row) =>
            <TableRow key={row.key}>
              {(columnKey) => {
                if (buttonRows.includes(columnKey)) {
                  return <TableCell>
                            <Chip size="md" variant="flat"
                              color = {statusColorMap[row.selected[columnKey]]}
                            >
                              {getKeyValue(row, columnKey)}
                            </Chip>
                          </TableCell>
                }
                else {
                  return <TableCell>{getKeyValue(row, columnKey)} </TableCell>
                }
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </main>
  );
}
