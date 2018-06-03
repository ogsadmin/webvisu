#! /usr/bin/perl

use strict;

my $ver = `svnversion .`;
chomp($ver);
my @verFields = split(/\:/, $ver);
if( scalar(@verFields) == 2 ) { $ver = $verFields[1]; }

open( INPUT, $ARGV[0] ) || die "can't open $ARGV[0]: $!";
while( <INPUT> ) {
	my $line = $_;
	$line =~ s/\(development\)/\(r$ver\)/;
	if( $line =~ /<script\ssrc="([^\"]+)"><\/script>/) { 
		my $file = $1;
		# replace "preprocessed" filenames
		$file =~ s/\.pp\.js/\.oo\.js/g;
		print "\n<script>\n"; 
		print `java -jar ../tools/yuicompressor-2.4.8.jar $file`;
		print "\n</script>\n"; 
	} else {
		print $line;
	};
}
