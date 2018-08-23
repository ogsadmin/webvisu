#! /usr/bin/perl

use strict;

# Kommandozeilen-Argumente
my $g_sHtmlFileName = $ARGV[0] || die "no HTML Filename given";
my $g_sHtmlTitle = $ARGV[1] || undef;

# SVN-Version des aktuellen Verzeichnisses ermitteln
my $g_sSvnVersion = `svnversion .`;
chomp($g_sSvnVersion);
my @verFields = split(/\:/, $g_sSvnVersion);
if( scalar(@verFields) == 2 ) { $g_sSvnVersion = $verFields[1]; }


open( INPUT, $g_sHtmlFileName ) || die "can't open $g_sHtmlFileName: $!";
while( <INPUT> ) {
	my $line = $_;
	# Falls wir den HTML-Titel ersetzen sollen
	if( $g_sHtmlTitle ) {
		$line =~ s/<title>.*<\/title>/<title>$g_sHtmlTitle<\/title>/;
	}
	# Andere Wildcards...
	$line =~ s/\!svnversion\!/$g_sSvnVersion/;
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
