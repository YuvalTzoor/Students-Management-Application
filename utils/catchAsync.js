//This function is catches the async functions and erros if exists
module.exports = fn => {
  return (req, res, next) =>{
    fn(req,res,next).catch(next);
  };
};