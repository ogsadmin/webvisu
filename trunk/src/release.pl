#! /usr/bin/perl

use strict;

my $ver = `svnversion .`;
chomp($ver);

open( INPUT, $ARGV[0] ) || die "can't open $ARGV[0]: $!";
while( <INPUT> ) {
	my $line = $_;
	$line =~ s/\(development\)/\(r$ver\)/;
	if( $line =~ /<script\ssrc="([^\"]+)"><\/script>/) { 
		my $file = $1;
		open( EMBED, $file ); 
		print "\n<script>\n"; 
		while( <EMBED> ) {
			my $embLine = $_;
			print $embLine;
		}
		print "\n</script>\n"; 
		close(EMBED);
	} else {
		print $line;
	};
}