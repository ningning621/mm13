function getFrequencyByKey(data, str, splitter="::", index = 0) {
  let map = new Map();
  for (var i = 0; i < data.length; i++) {
      let key = data[i][str].split(splitter)[index];
      // let key = data[i][str];
      if (!map.has(key)) {
          map.set(key, 1);
      } else {
          map.set(key, map.get(key) + 1);
      }
  }

  let sortedMap = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
  return sortedMap;
}

function getYearTotal(data, key) {
  let map = {};
  for(var i = 0; i < data.length; i++) {
    let year = Number(data[i]["Month"].split("/")[2]);

    if (year > 2009) {
      let category = data[i]["Category"];

      // check for missing key 
      if (!(category in map)) {
        map[category] = {};
      } 

      if (!(year in map[category])) {
        map[category][year] = 0;
      }
      
      map[category][year] += Number(data[i][key]);
    }
  }
  return map;
}

function generateAllRank(data) {
  let rankings = {};
  for (var year = 2010; year < 2021; year++) {
    rankings[year] = generateRank(data, year);
  }
  return rankings;
}

function generateRank(data, year) {
  let map = new Map();

  for (var cat of Object.keys(data)) {
    map.set(cat, data[cat][year]);
  }

  let sortedMap = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
  // console.log(sortedMap)
  let rankings = {};
  let counter = 0;
  for (var cat of sortedMap.keys()) {
    rankings[cat] = counter;
    counter = counter+1;
  }
  return rankings;
}

function getListByYear(data, key, key2, year) {
  let finalList = [];
  let filteredData = data.filter(d => d["Category"] == key); 

  for (var item of filteredData) {
    let yr = Number(item["Month"].split("/")[2]);
    if (yr == year) {
      let month = Number(item["Month"].split("/")[0]);

      finalList.push({"month": month, "amt": item[key2]});
    }
  }

  finalList.push({"month": 1, "amt": finalList[0]["amt"]});

  return finalList;
}

function formatMonth(num) {
  let arr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return arr[num-1];
}

function getTotalByYear(data, key) {
  let map = {};
  for(var i = 0; i < data.length; i++) {
    let year = Number(data[i]["Month"].split("/")[2]);

    if (year >= 2000) {
      let month = Number(data[i]["Month"].split("/")[0]);

      // check for missing key 
      if (!(year in map)) {
        map[year] = {};
      } 

      if (!(month in map[year])) {
        map[year][month] = 0;
      }
      
      map[year][month] += Number(data[i][key]);
    }
  }

  let finalList = [];
  for (var i = 2000; i < 2021; i++) {
    let tempList = [];
    for (var j = 1; j < 13; j++) {
      tempList.push({"month": j, "amt": map[i][j]});
    }
    tempList.push({"month": 1, "amt": tempList[0]["amt"]});
    finalList.push(tempList);
  }
  return finalList;
}