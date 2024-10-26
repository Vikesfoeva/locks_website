import React, { useEffect, useState} from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses }  from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TablePagination from '@mui/material/TablePagination';
import { Delete} from '@mui/icons-material';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Navbar from './navbar';

function index() {
  const [gameData, setGameData] = useState([]);
  const [choiceData, setChoiceData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [rowsPerPageOptions, setrowsPerPageOptions] = useState([]);

  let baseURL = "";

  const constHeightPerRow = 55;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const columns_choices = [
    {key: "cfb_nfl", label: "CFB / NFL"},
    {key: "name_away", label: "Away"},
    {key: "name_home", label: "Home Home"},
    {key: "choice", label: "Choice"},
    {key: "value", label: "Value"},
    {key: "time", label: "Game Time ET"},
    {key: "button", label: "Actions"}
  ];

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
  
  const columns_options = [
    {key: "cfb_nfl", label: "CFB / NFL"},
    {key: "abbrev_away", label: "Abbrev"},
    {key: "line_away", label: "Away Line"},
    {key: "abbrev_home", label: "Abbrev"},
    {key: "line_home", label: "Home Line"},
    {key: "over", label: "Over" },
    {key: "under", label: "Under" },
    {key: "name_away", label: "Away Name"},
    {key: "name_home",label: "Home Name"},
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
        "value": gameData[foundIndexForRow][choice],
        "time": gameData[foundIndexForRow]['time'],
      });
    } else {
      window.alert("Hey now - you can't pick 4 things.")
    }

    setGameData(updatedGameData)
    setChoiceData(fillChoicesTable(updatedChoices));
  }

  useEffect(() => {
    
    // Check if dev environment
    const thisURL = window.location.href;
    if (thisURL.includes("localhost")) {
      baseURL = "http://localhost:8080/";
    }
    console.log(baseURL)

    fetch(baseURL+ "api/testing")
    .then(res => res.json())
    .then((out) => {
      setGameData(out.data);
      setChoiceData(fillChoicesTable([]));
      const cleanRows = Math.floor(window.innerHeight / constHeightPerRow);
      setRowsPerPage(out.data.length)
      setrowsPerPageOptions([out.data.length, cleanRows,cleanRows*2, cleanRows*5])
    });
  }, [])
  
  return (
    <main>
      <Navbar />
      <TableContainer sx={{ maxHeight: 20/100}}>
        <Table size="small" stickyHeader>
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
                        <TableCell>
                          <IconButton 
                              color="error" 
                              size="small" 
                              onClick={() => {
                                  handleMakeSelection(row, row['choice'], true)
                                }}>
                            <Delete /></IconButton>
                          </TableCell>
                      </TableRow>
            }
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Container sx={{padding: 1}}>
        <Box   display="flex"
              justifyContent="center"
              alignItems="center">
          <Button 
            variant="contained" 
            color="success" 
            size="small"
            onClick={async() => {

              const submissions: Object[] = [];
              for (let i: number = 0; i < choiceData.length; i++) {
                if (choiceData[i]['cfb_nfl'] !== "TBD") {
                  submissions.push(choiceData[i]);
                }
              }

              if (submissions.length === 0) {
                window.alert("No selections made");
                return;
              }
              const thisURL = window.location.href;
              if (thisURL.includes("localhost")) {
                baseURL = "http://localhost:8080/";
              }
              const response = await fetch(baseURL+ "api/triggerSubmission", {
                method: "POST",
                body: JSON.stringify({ selections: submissions}),
                headers: {
                  "Content-Type": "application/json",
                },
              })
              console.log(response.status)
              if (response.status >= 200 && response.status < 300) {
                window.alert("Submission successful")
              } else {
                window.alert("Submission issue")
              }
            }}
          >Submit Locks</Button>
        </Box>
      </Container>
    {/* Locks Table */}
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
    <TableContainer sx={{ maxHeight: "100vh"}}>
    <Table  stickyHeader aria-label="sticky table" size="small">
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
            gameData
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((game: any) => {
              return <TableRow key={game['key']} hover role="checkbox" tabIndex={-1} >
                <TableCell key={`${game['key']}_cfb_nfl`}>{game['cfb_nfl']}</TableCell>
                
                <TableCell key={`${game['key']}_abbrev_away`}>{game['abbrev_away']}</TableCell>
                <TableCell key={`${game['key']}_line_away`}>
                  <Chip label={game['line_away']} 
                      color={statusColorMap[game["selected"]["line_away"] as string]}
                      clickable={true}
                      size="small"
                      onClick={() => handleMakeSelection(game, "line_away")}
                    />
                </TableCell>
                
                <TableCell key={`${game['key']}_abbrev_home`}>{game['abbrev_home']}</TableCell>
                <TableCell key={`${game['key']}_line_home`}>
                  <Chip label={game['line_home']}  
                      color={statusColorMap[game["selected"]["line_home"] as string]}
                      clickable={true}
                      size="small"
                      onClick={() => handleMakeSelection(game, "line_home")}
                    />
                </TableCell>
                <TableCell key={`${game['key']}_over`}>
                  <Chip label={game['over']} 
                    color={statusColorMap[game["selected"]["over"] as string]}
                    clickable={true}
                    size="small"
                    onClick={() => handleMakeSelection(game, "over")}
                    />
                </TableCell>
                <TableCell key={`${game['key']}_under`}>
                <Chip label={game['under']} 
                    color={statusColorMap[game["selected"]["under"] as string]}
                    clickable={true}
                    size="small"
                    onClick={() => handleMakeSelection(game, "under")}
                  />
                </TableCell>
                <TableCell key={`${game['key']}_name_away`}>{game['name_away']}</TableCell>
                <TableCell key={`${game['key']}_name_home`}>{game['name_home']}</TableCell>
                <TableCell key={`${game['key']}_time`}>{game['time']}</TableCell>
              </TableRow>
          })}
      </TableBody>
    </Table>
    </TableContainer>
    <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={gameData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  </main>
  )
}

export default index