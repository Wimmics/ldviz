
// TODO: reorganize this file according to the utility. 

// Currently, this function is used to update the files of annotations, so maybe an Annotation class would be more appropriate
function update_file(path, data){
    var file = fs.readFileSync(path,"utf8");
    file = JSON.parse(file);
    
    file.push(data);
    fs.writeFileSync(path, JSON.stringify(file), (err) => {
        if (err)
          console.log(err);
        else {
          console.log("File written successfully\n");
          console.log("The written has the following contents:");
          console.log(fs.readFileSync(path, "utf8"));
        }
    })
}

// Rebuild query from req.query. Helper function when login is necessary.
function getQuery(obj) {
    let values = []
    Object.keys(obj).forEach(key => {
        values.push(`${key}=${encodeURIComponent(obj[key])}`)
    })
    return '?' + values.join('&')
}

module.exports = { getQuery, update_file }