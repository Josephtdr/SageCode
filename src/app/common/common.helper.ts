export default class Utils {
    static checkEmail(email: string) : boolean {
      var hasTextBeforeAt = false;
      var hasAt = false;
      var hasTextAfterAt = false;
      var hasDot = false;
      var hasTextAfterDot = false;
      for (var i = 0; i < email.length; i++) {
        var currentChar = email[i];
        if (currentChar != '@' && !hasAt) hasTextBeforeAt = true;
        if (hasTextBeforeAt && currentChar == '@') hasAt = true;
        if (hasAt && currentChar != '@' && currentChar != '.') hasTextAfterAt = true;
        if (hasTextAfterAt && currentChar == '.') hasDot = true;
        if (hasDot && currentChar != '.' && currentChar != '@') return true;
      }
      return false;
    }

    static checkNumber(number: string) : boolean {
      if(number.match(/^\d{11}$/)) return true;
      else return false;
    }

    static checkExists(value: string) : boolean {
      return !this.isEmptyOrWhiteSpace(value);
    }

    static checkPercentage(value: string) : boolean {
      for (var i = 0; i < value.length; i++) if (value[i] == '.') return false;
      return !isNaN(parseInt(value)) && 0 < parseInt(value) && parseInt(value) <= 100;
    }

    static checkPassword(password: string) : boolean {
      return password.length >= 6 && this.checkExists(password);
    }

    static checkPasswords(password1: string, password2: string) : boolean {
      return this.checkPassword(password1) && this.checkPassword(password2) && password1 == password2;
    }

    static isEmptyOrWhiteSpace(value: string) : boolean {
      if (typeof value === 'undefined' || value == null) return true;
      return value.replace(/\s/g, '').length < 1;
    }
}
