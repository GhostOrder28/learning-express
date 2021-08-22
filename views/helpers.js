module.exports = {
  checkForErrors(errors, prop){
    try {
      return errors.mapped()[prop].msg;
    } catch(err) {
      return '';
    }
  }
}
