const mongoose = require("mongoose");
const ticketSchema = new mongoose.Schema(
    {
      
        full_name: String,
        user_id: String,
        Museum: String,
        contact:String,
        date:String,
        no_person:String,
        time:String,
        
    },
    { collection: 'ticketForm' }
  );
  
  const TicketForm = mongoose.model("TicketForm", ticketSchema);
  module.exports = TicketForm;