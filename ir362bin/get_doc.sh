#!/bin/bash
fullPath () {
	t='TEMP=`cd $TEMP; pwd`'
	for d in $*; do
		eval `echo $t | sed 's/TEMP/'$d'/g'`
	done
}

TERRIER_BIN=`dirname $0`
if [ -e "$TERRIER_BIN/terrier-env.sh" ];
then
	. $TERRIER_BIN/terrier-env.sh
fi

#setup TERRIER_HOME
if [ ! -n "$TERRIER_HOME" ]
then
	#find out where this script is running
	TEMPVAR=`dirname $0`
	#make the path abolute
	fullPath TEMPVAR
	#terrier folder is folder above
	TERRIER_HOME=`dirname $TEMPVAR`
	#echo "Setting TERRIER_HOME to $TERRIER_HOME"
fi

#$TERRIER_HOME/bin/anyclass.sh org.ir362.YoungIR362Test $@
cat `sed -n "$(($1 + 1))p" $TERRIER_HOME/etc/collection.spec`
