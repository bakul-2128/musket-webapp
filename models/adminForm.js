const mongoose = require("mongoose");
const formSchema = new mongoose.Schema(
    {
      
        title: String,
        content: String,
        link1: String,
        slink2:String,
        slink3:String,
        open:String,
        close:String,
        maplink:String,
    },
    { collection: 'adminForm' }
  );
  
  const AdminForm = mongoose.model("AdminForm", formSchema);
  module.exports = AdminForm;