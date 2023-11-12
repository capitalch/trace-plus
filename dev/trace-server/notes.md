## startup
- uninstall all python and delete python installations from c://program files
- install python custom, for all users and include in path. At this time it was 3.12
- Now on typing python on terminal it shows python 3.12
## Virtual environment
- python -m venv env // creates env environment
- The -m flag: Searches sys.path for the module named after the flag, and then executes its contents as the __main__ module. 
- **env\scripts\activate**

## python
# identifiers
- Python Class names start with an uppercase letter. All other identifiers start with a lowercase letter.
- An identifier with a single leading underscore indicates private identifier. Starting with two leading underscores indicates a strongly private identifier.
- If the identifier also ends with two trailing underscores, the identifier is a language-defined special name.

# Data types
- List: [2023, "Python", 3.11, 5+6j, 1.23E-4]. List can have multi data types
- Tuple: (2023, "Python", 3.11, 5+6j, 1.23E-4)
- range(): range(start, stop, step)
- dict: {1:'one', 2:'two', 3:'three'}
- set: {2023, "Python", 3.11, 5+6j, 1.23E-4} # An object cannot appear more than once in a set

# type casting
- int(), str(), float(), tuple(), list(), set(), dict()

# control
- if elif else
- for while

# functions
- keyword arguments are same as named arguments
- positional arguments should be before the named args
- to enforce only keyword or named arguments, put an astrix before the keyword arguments. #def intr(amt,*, rate)#. Here rate is now keyword argument. Should be called as interest = intr(1000, rate=10)
- def intr(amt, rate, /). We make both the arguments of intr() function as positional-only by putting "/" at the end.
- arbitrary arguments (variable length)
	- An argument prefixed with a single asterisk * is for arbitrary positional arguments.
	- An argument prefixed with two asterisks ** is for arbitrary keyword or named arguments.
	# sum of numbers: Below the args becomes a tuple and stores all the values
		def add(*args):
		   s=0
		   for x in args:
		      s=s+x
		   return s
-		   
		result = add(10,20,30,40)
		print (result)

		result = add(1,2,3)
		print (result)
# Annotations or type
- def myfunction(a: int, b: int) -> int:
	c = a+b
	return c
- Annotations are mentioned by : after a value. Annotation is ignored by interpreter. So you can put and value as annotation

# modules
- modules are used through **import** statement
	- import myModule
	- from myModule import myFunc
	- How do you find that the current file is used as module or entry point file?
		- if __name__ == "__main__":
		- Here you find out that the current file is the main file and not the module or imported file
# string
- strings are immutable
- to make changes in string, convert to List by list() func, make chages then convert back by join() func
- a "r" or "R" before a string makes it raw string and it does not interpret the escape chars
