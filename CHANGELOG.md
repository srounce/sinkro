# v1.2.2

###### Fixes

* Fix for defaultProps being overwritten(/not being used) (#13)
* Remove usage of deprecated componentWillMount method (#10)
---

# v1.2.1

###### Fixes

* Fix `ReferenceError` when passing null in `subscriptionMap`
* Fix unmounted components delaying subscription, instead subscribe in constructor and ignore emissions until mount

---

# v1.2.0

###### Features

* Add `share` flag to allow configurability of internal stream 'hotness'

###### Fixes

* Replace 'magic' numbers in tests

---

# v1.1.0

###### Features

* Expose props/stream update comparison functions via `compareProps` & `compareStream` options

###### Fixes

* Remove stray debugger statement from internal subscription 'end' handler

---

# v1.0.1

###### Documentation

* Fixed error in example

###### Misc

* Added keywords to package.json
* Removed prepublish npm-script

---

# v1.0.0

Initial release
