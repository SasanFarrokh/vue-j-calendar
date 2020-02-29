import moment from 'moment-jalaali'

export default {
  props: {
    jalaali: {
      type: Boolean,
      default: true
    },

    minDate: {
      type: [Date, String, Object, Number],
      default: () => moment()
    },

    maxDate: {
      type: [Date, String, Object, Number],
      default: () => moment().add(1, 'year')
    },

    /**
         * A function that returns classes for day blocks
         * @param day object like { day: moment, classes: {} }
         * @param a function that returns classes (day, defaultClassGen) => defaultClassGen(day) : Object
         */
    dayClasses: {
      type: Function,
      default: (day, dcg) => dcg(day)
    }
  },

  data () {
    return {
      ssr:  typeof process !== 'undefined' && process.server,
      mobile:  typeof window !== 'undefined' && window.innerWidth < 768,
    }
  },

  methods: {
    weekday (i) {
      if (this.jalaali) {
        return moment.weekdays(true)[i].slice(0, 1)
      }
      const data = moment.localeData('en')
      const days = data.weekdaysMin()
      return days[i]
    },

    monthName (m) {
      if (this.jalaali) {
        return m.format('jMMMM')
      }
      const data = moment.localeData('en')
      return data._months[m.month()]
    }
  }
}
